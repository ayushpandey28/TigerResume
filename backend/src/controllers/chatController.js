const chatService = require('../services/chat/chatService');
const { success, error } = require('../utils/response');

const sendMessage = async (req, res, next) => {
  try {
    const { resumeId, jobDescriptionId, message } = req.body;

    if (!resumeId || !message) {
      return error(res, 'Both resumeId and message are required', 400);
    }

    const result = await chatService.sendMessage(
      { resumeId, jobDescriptionId, message },
      req.user._id
    );

    return success(res, result, 'Chat response generated successfully');
  } catch (err) {
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    if (!resumeId) {
      return error(res, 'Resume ID is required', 400);
    }

    const messages = await chatService.getHistoryByResumeId(resumeId, req.user._id);
    return success(res, { messages }, 'Chat history retrieved successfully');
  } catch (err) {
    next(err);
  }
};

const newChat = async (req, res, next) => {
  try {
    const { resumeId } = req.body;
    if (!resumeId) {
      return error(res, 'Resume ID is required', 400);
    }

    const result = await chatService.createNewChat(resumeId, req.user._id);
    return success(res, result, 'New chat session initialized');
  } catch (err) {
    next(err);
  }
};

const deleteChat = async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    if (!resumeId) {
      return error(res, 'Resume ID is required', 400);
    }

    const result = await chatService.deleteChatByResumeId(resumeId, req.user._id);
    return success(res, result, 'Chat session deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  sendMessage,
  getHistory,
  newChat,
  deleteChat
};

