/**
 * Success response helper
 */
exports.successResponse = (res, message = 'Success', data = {}, statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  };
  
  /**
   * Error response helper
   */
  exports.errorResponse = (res, message = 'Error', statusCode = 500, errors = []) => {
    return res.status(statusCode).json({
      success: false,
      message,
      errors: errors.length > 0 ? errors : undefined
    });
  };
  
  /**
   * Format validation errors from express-validator
   */
  exports.formatValidationErrors = (validationErrors) => {
    if (!validationErrors || !Array.isArray(validationErrors)) {
      return [];
    }
    
    return validationErrors.map(error => ({
      field: error.param,
      message: error.msg
    }));
  };