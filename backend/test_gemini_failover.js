const assert = require('assert');
const geminiConfig = require('./src/config/gemini');
const geminiService = require('./src/services/ai/geminiService');
const aiService = require('./src/services/ai/aiService');

async function runGeminiFailoverTestSuite() {
  console.log('=== RUNNING TIGERRESUME GEMINI FAILOVER TEST SUITE ===\n');
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    Error: ${err.message}`);
      if (err.stack) {
        console.error(`    Stack: ${err.stack.split('\n').slice(1, 4).join('\n')}`);
      }
    }
  }

  const originalEnvApiKey = process.env.GEMINI_API_KEY;
  const originalEnvModel = process.env.GEMINI_MODEL;

  const restoreEnv = () => {
    if (originalEnvApiKey !== undefined) {
      process.env.GEMINI_API_KEY = originalEnvApiKey;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
    if (originalEnvModel !== undefined) {
      process.env.GEMINI_MODEL = originalEnvModel;
    } else {
      delete process.env.GEMINI_MODEL;
    }
    geminiConfig.resetForTesting();
  };

  try {
    // --- TEST 1: Primary model succeeds ---
    await test('TEST 1: Primary model succeeds (Fallbacks not attempted)', async () => {
      process.env.GEMINI_API_KEY = 'test-valid-api-key';
      delete process.env.GEMINI_MODEL;
      geminiConfig.resetForTesting();

      const attemptedModels = [];
      const chain = geminiConfig.getModelChain();

      const mockGenerativeModel = (modelName) => ({
        generateContent: async (prompt) => {
          attemptedModels.push(modelName);
          return {
            response: {
              text: () => JSON.stringify({ overall_assessment: 'Primary success' })
            }
          };
        }
      });

      // Override getGenerativeModel for test
      const originalGetGenerativeModel = geminiConfig.getGenerativeModel;
      geminiConfig.getGenerativeModel = mockGenerativeModel;

      try {
        const res = await geminiService.executeWithFailover('test prompt');
        assert.strictEqual(res.overall_assessment, 'Primary success');
        assert.strictEqual(attemptedModels.length, 1);
        assert.strictEqual(attemptedModels[0], chain[0]);
      } finally {
        geminiConfig.getGenerativeModel = originalGetGenerativeModel;
      }
    });

    // --- TEST 2: Primary returns model-not-found -> Fallback 1 succeeds ---
    await test('TEST 2: Primary returns model-not-found (Fallback 1 succeeds)', async () => {
      process.env.GEMINI_API_KEY = 'test-valid-api-key';
      delete process.env.GEMINI_MODEL;
      geminiConfig.resetForTesting();

      const attemptedModels = [];
      const chain = geminiConfig.getModelChain();

      const mockGenerativeModel = (modelName) => ({
        generateContent: async (prompt) => {
          attemptedModels.push(modelName);
          if (modelName === chain[0]) {
            const err = new Error(`models/${modelName} is not found for API version v1beta`);
            err.status = 404;
            throw err;
          }
          return {
            response: {
              text: () => JSON.stringify({ overall_assessment: 'Fallback 1 success' })
            }
          };
        }
      });

      const originalGetGenerativeModel = geminiConfig.getGenerativeModel;
      geminiConfig.getGenerativeModel = mockGenerativeModel;

      try {
        const res = await geminiService.executeWithFailover('test prompt');
        assert.strictEqual(res.overall_assessment, 'Fallback 1 success');
        assert.strictEqual(attemptedModels.length, 2);
        assert.strictEqual(attemptedModels[0], chain[0]);
        assert.strictEqual(attemptedModels[1], chain[1]);
      } finally {
        geminiConfig.getGenerativeModel = originalGetGenerativeModel;
      }
    });

    // --- TEST 3: Primary and fallback 1 fail -> Fallback 2 succeeds ---
    await test('TEST 3: Primary and Fallback 1 fail (Fallback 2 succeeds)', async () => {
      process.env.GEMINI_API_KEY = 'test-valid-api-key';
      delete process.env.GEMINI_MODEL;
      geminiConfig.resetForTesting();

      const attemptedModels = [];
      const chain = geminiConfig.getModelChain();

      const mockGenerativeModel = (modelName) => ({
        generateContent: async (prompt) => {
          attemptedModels.push(modelName);
          if (modelName === chain[0] || modelName === chain[1]) {
            const err = new Error(`Model ${modelName} unavailable or deprecated`);
            err.status = 503;
            throw err;
          }
          return {
            response: {
              text: () => JSON.stringify({ overall_assessment: 'Fallback 2 success' })
            }
          };
        }
      });

      const originalGetGenerativeModel = geminiConfig.getGenerativeModel;
      geminiConfig.getGenerativeModel = mockGenerativeModel;

      try {
        const res = await geminiService.executeWithFailover('test prompt');
        assert.strictEqual(res.overall_assessment, 'Fallback 2 success');
        assert.strictEqual(attemptedModels.length, 3);
        assert.strictEqual(attemptedModels[2], chain[2]);
      } finally {
        geminiConfig.getGenerativeModel = originalGetGenerativeModel;
      }
    });

    // --- TEST 4: Several models fail sequentially ---
    await test('TEST 4: Several models fail sequentially until one succeeds', async () => {
      process.env.GEMINI_API_KEY = 'test-valid-api-key';
      delete process.env.GEMINI_MODEL;
      geminiConfig.resetForTesting();

      const attemptedModels = [];
      const chain = geminiConfig.getModelChain();

      const mockGenerativeModel = (modelName) => ({
        generateContent: async (prompt) => {
          attemptedModels.push(modelName);
          if (attemptedModels.length < 5) {
            const err = new Error(`Model ${modelName} 404 not found`);
            err.status = 404;
            throw err;
          }
          return {
            response: {
              text: () => JSON.stringify({ result: 'Success on 5th model' })
            }
          };
        }
      });

      const originalGetGenerativeModel = geminiConfig.getGenerativeModel;
      geminiConfig.getGenerativeModel = mockGenerativeModel;

      try {
        const res = await geminiService.executeWithFailover('test prompt');
        assert.strictEqual(res.result, 'Success on 5th model');
        assert.strictEqual(attemptedModels.length, 5);
        assert.strictEqual(attemptedModels[4], chain[4]);
      } finally {
        geminiConfig.getGenerativeModel = originalGetGenerativeModel;
      }
    });

    // --- TEST 5: A model succeeds -> No further models attempted ---
    await test('TEST 5: A model succeeds (No further models attempted)', async () => {
      process.env.GEMINI_API_KEY = 'test-valid-api-key';
      delete process.env.GEMINI_MODEL;
      geminiConfig.resetForTesting();

      const attemptedModels = [];
      const chain = geminiConfig.getModelChain();

      const mockGenerativeModel = (modelName) => ({
        generateContent: async () => {
          attemptedModels.push(modelName);
          return {
            response: { text: () => '{"status":"ok"}' }
          };
        }
      });

      const originalGetGenerativeModel = geminiConfig.getGenerativeModel;
      geminiConfig.getGenerativeModel = mockGenerativeModel;

      try {
        await geminiService.executeWithFailover('test prompt');
        assert.strictEqual(attemptedModels.length, 1);
        assert.strictEqual(chain.length > 1, true); // Verified chain has fallbacks that were NOT called
      } finally {
        geminiConfig.getGenerativeModel = originalGetGenerativeModel;
      }
    });

    // --- TEST 6: All models fail -> Clean controlled error ---
    await test('TEST 6: All models fail (Returns clean controlled error)', async () => {
      process.env.GEMINI_API_KEY = 'test-valid-api-key';
      delete process.env.GEMINI_MODEL;
      geminiConfig.resetForTesting();

      const chain = geminiConfig.getModelChain();
      let attemptCount = 0;

      const mockGenerativeModel = (modelName) => ({
        generateContent: async () => {
          attemptCount++;
          const err = new Error(`Model ${modelName} unavailable 503`);
          err.status = 503;
          throw err;
        }
      });

      const originalGetGenerativeModel = geminiConfig.getGenerativeModel;
      geminiConfig.getGenerativeModel = mockGenerativeModel;

      try {
        await geminiService.executeWithFailover('test prompt');
        assert.fail('Should have thrown an error');
      } catch (err) {
        assert.strictEqual(attemptCount, chain.length);
        assert.strictEqual(err.statusCode, 503);
        assert.strictEqual(err.message, 'AI service is temporarily unavailable. Please try again shortly.');
      } finally {
        geminiConfig.getGenerativeModel = originalGetGenerativeModel;
      }
    });

    // --- TEST 7: Invalid GEMINI_MODEL environment variable ---
    await test('TEST 7: Invalid GEMINI_MODEL env var (Normalizes to verified primary model)', async () => {
      process.env.GEMINI_API_KEY = 'test-valid-api-key';
      process.env.GEMINI_MODEL = 'gemini-non-existent-fictional-v999';
      geminiConfig.resetForTesting();

      const chain = geminiConfig.getModelChain();
      assert.strictEqual(chain[0], geminiConfig.PRIMARY_MODEL); // Must normalize to gemini-3.5-flash-lite
      assert.ok(!chain.includes('gemini-non-existent-fictional-v999'));
    });

    // --- TEST 8: No GEMINI_API_KEY ---
    await test('TEST 8: No GEMINI_API_KEY (AI reported unavailable without crashing)', async () => {
      delete process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_MODEL;
      geminiConfig.resetForTesting();

      assert.strictEqual(geminiConfig.isAvailable(), false);
      assert.strictEqual(aiService.isAIAvailable(), false);

      try {
        await geminiService.executeWithFailover('test prompt');
        assert.fail('Should have thrown 503 error');
      } catch (err) {
        assert.strictEqual(err.statusCode, 503);
        assert.ok(err.message.includes('not configured') || err.message.includes('unavailable'));
      }
    });

    // --- TEST 9: Invalid API key -> Do NOT cycle through all models ---
    await test('TEST 9: Invalid API key (Does NOT waste time cycling through models)', async () => {
      process.env.GEMINI_API_KEY = 'invalid-key';
      delete process.env.GEMINI_MODEL;
      geminiConfig.resetForTesting();

      let attempts = 0;

      const mockGenerativeModel = (modelName) => ({
        generateContent: async () => {
          attempts++;
          const err = new Error('API_KEY_INVALID: API key not valid. Please pass a valid API key.');
          err.status = 400;
          throw err;
        }
      });

      const originalGetGenerativeModel = geminiConfig.getGenerativeModel;
      geminiConfig.getGenerativeModel = mockGenerativeModel;

      try {
        await geminiService.executeWithFailover('test prompt');
        assert.fail('Should have thrown auth error');
      } catch (err) {
        assert.strictEqual(attempts, 1); // EXACTLY 1 attempt, did not cycle!
        assert.strictEqual(err.statusCode, 401);
        assert.strictEqual(err.message, 'AI service configuration or authentication failed.');
      } finally {
        geminiConfig.getGenerativeModel = originalGetGenerativeModel;
      }
    });

    // --- TEST 10: Malformed JSON ---
    await test('TEST 10: Malformed JSON (Safe parsing / error handling)', async () => {
      assert.throws(() => {
        geminiService.parseJSONSafely('this is not json at all {broken');
      }, /Response did not contain valid JSON/);

      // Trailing comma recovery test
      const recoverable = '{\n  "name": "TigerResume",\n  "skills": ["JS", "Node",]\n}';
      const parsed = geminiService.parseJSONSafely(recoverable);
      assert.strictEqual(parsed.name, 'TigerResume');
      assert.strictEqual(parsed.skills.length, 2);
    });

    // --- TEST 11: Markdown fenced JSON ---
    await test('TEST 11: Markdown fenced JSON (Correct parsing)', async () => {
      const fenced = '```json\n{\n  "overall_assessment": "Excellent resume."\n}\n```';
      const parsed = geminiService.parseJSONSafely(fenced);
      assert.strictEqual(parsed.overall_assessment, 'Excellent resume.');

      const fencedText = '```text\n{\n  "title": "Software Engineer"\n}\n```';
      const parsedText = geminiService.parseJSONSafely(fencedText);
      assert.strictEqual(parsedText.title, 'Software Engineer');

      const surrounded = 'Here is your analysis report:\n{\n  "score": 95\n}\nHope this helps!';
      const parsedSurrounded = geminiService.parseJSONSafely(surrounded);
      assert.strictEqual(parsedSurrounded.score, 95);
    });

    // --- TEST 12: Concurrent AI requests ---
    await test('TEST 12: Concurrent AI requests (No race conditions or client duplication)', async () => {
      process.env.GEMINI_API_KEY = 'test-valid-api-key';
      delete process.env.GEMINI_MODEL;
      geminiConfig.resetForTesting();

      const mockGenerativeModel = (modelName) => ({
        generateContent: async (prompt) => {
          return {
            response: {
              text: () => JSON.stringify({ promptReceived: prompt })
            }
          };
        }
      });

      const originalGetGenerativeModel = geminiConfig.getGenerativeModel;
      geminiConfig.getGenerativeModel = mockGenerativeModel;

      try {
        const promises = Array.from({ length: 10 }, (_, i) =>
          geminiService.executeWithFailover(`prompt-${i}`)
        );

        const results = await Promise.all(promises);
        assert.strictEqual(results.length, 10);
        results.forEach((res, i) => {
          assert.strictEqual(res.promptReceived, `prompt-${i}`);
        });
      } finally {
        geminiConfig.getGenerativeModel = originalGetGenerativeModel;
      }
    });

    // --- TEST 13: Existing AI service APIs ---
    await test('TEST 13: Verify all 8 existing AI methods continue working contractually', async () => {
      process.env.GEMINI_API_KEY = 'test-valid-api-key';
      delete process.env.GEMINI_MODEL;
      geminiConfig.resetForTesting();

      const mockGenerativeModel = () => ({
        generateContent: async (prompt) => {
          if (typeof prompt === 'string' && prompt.includes('chat')) {
            return { response: { text: () => 'AI chat response' } };
          }
          return {
            response: {
              text: () => JSON.stringify({
                overall_assessment: 'Valid',
                title: 'Software Engineer',
                strengths: ['coding'],
                summary: { original: 'a', improved: 'b' }
              })
            }
          };
        }
      });

      const originalGetGenerativeModel = geminiConfig.getGenerativeModel;
      geminiConfig.getGenerativeModel = mockGenerativeModel;

      try {
        const res1 = await aiService.analyzeResume('Resume text');
        assert.strictEqual(typeof res1.overall_assessment, 'string');

        const res2 = await aiService.analyzeJobDescription('Job text');
        assert.strictEqual(typeof res2.title, 'string');

        const res3 = await aiService.matchResumeToJob({}, {});
        assert.ok(res3);

        const res4 = await aiService.optimizeResume({}, {});
        assert.strictEqual(typeof res4.summary.improved, 'string');

        const res5 = await aiService.generateJobDescription({ jobTitle: 'Dev' });
        assert.strictEqual(res5.title, 'Dev');

        const res6 = await aiService.chatAboutResume({ message: 'chat' });
        assert.strictEqual(res6, 'AI chat response');

        const res7 = await aiService.analyzeGitHub({ username: 'test' });
        assert.ok(res7);

        const res8 = await aiService.analyzeLinkedIn({ name: 'test' });
        assert.ok(res8);
      } finally {
        geminiConfig.getGenerativeModel = originalGetGenerativeModel;
      }
    });

  } finally {
    restoreEnv();
  }

  console.log(`\nGEMINI FAILOVER TEST SUITE SUMMARY: ${passed}/${total} tests passed.`);
  if (passed === total) {
    console.log('ALL 13 GEMINI FAILOVER TESTS PASSED SUCCESSFULLY! ✓\n');
  } else {
    process.exit(1);
  }
}

runGeminiFailoverTestSuite().catch((err) => {
  console.error('Fatal Gemini Failover Test Suite Error:', err);
  process.exit(1);
});
