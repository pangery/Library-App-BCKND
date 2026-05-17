/**
 * Standard dtoIn validation; builds uuAppErrorMap.invalidDtoIn on failure.
 */
function buildInvalidDtoIn(message, params = {}) {
  return {
    invalidDtoIn: {
      message,
      params,
    },
  };
}

function isBlank(value) {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  return false;
}

const ValidationHelper = {
  validateBookCreate(dtoIn) {
    if (!dtoIn || typeof dtoIn !== 'object') {
      return {
        valid: false,
        uuAppErrorMap: buildInvalidDtoIn('dtoIn must be an object.'),
      };
    }

    const missing = [];
    if (isBlank(dtoIn.title)) missing.push('title');
    if (isBlank(dtoIn.authorId)) missing.push('authorId');

    if (missing.length > 0) {
      return {
        valid: false,
        uuAppErrorMap: buildInvalidDtoIn('Required fields are missing.', {
          missingParameters: missing,
        }),
      };
    }

    return { valid: true, uuAppErrorMap: {} };
  },

  validateAuthorUpdate(dtoIn) {
    if (!dtoIn || typeof dtoIn !== 'object') {
      return {
        valid: false,
        uuAppErrorMap: buildInvalidDtoIn('dtoIn must be an object.'),
      };
    }

    const missing = [];
    if (isBlank(dtoIn.id)) missing.push('id');
    if (isBlank(dtoIn.name)) missing.push('name');
    if (isBlank(dtoIn.surname)) missing.push('surname');

    if (missing.length > 0) {
      return {
        valid: false,
        uuAppErrorMap: buildInvalidDtoIn('Required fields are missing.', {
          missingParameters: missing,
        }),
      };
    }

    return { valid: true, uuAppErrorMap: {} };
  },

  validateAuthorDelete(dtoIn) {
    if (!dtoIn || typeof dtoIn !== 'object') {
      return {
        valid: false,
        uuAppErrorMap: buildInvalidDtoIn('dtoIn must be an object.'),
      };
    }

    if (isBlank(dtoIn.id)) {
      return {
        valid: false,
        uuAppErrorMap: buildInvalidDtoIn('Required field id is missing.', {
          missingParameters: ['id'],
        }),
      };
    }

    return { valid: true, uuAppErrorMap: {} };
  },
};

module.exports = ValidationHelper;
