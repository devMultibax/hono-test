/**
 * OpenAPI component schemas
 * Contains all data model definitions for documentation
 */

export const OPENAPI_SCHEMAS = {
  Error: {
    type: 'object',
    properties: {
      error: {
        type: 'object',
        properties: {
          code: { type: 'string', example: 'USER_NOT_FOUND' },
          message: { type: 'string', example: 'The requested resource was not found' },
          details: {}
        },
        required: ['code', 'message']
      }
    },
    required: ['error']
  },
  User: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        example: 1
      },
      username: {
        type: 'string',
        example: 'user01'
      },
      firstName: {
        type: 'string',
        example: 'John'
      },
      lastName: {
        type: 'string',
        example: 'Doe'
      },
      departmentId: {
        type: 'integer',
        example: 1
      },
      sectionId: {
        type: 'integer',
        nullable: true,
        example: 1
      },
      email: {
        type: 'string',
        nullable: true,
        example: 'john@example.com'
      },
      tel: {
        type: 'string',
        nullable: true,
        example: '0812345678'
      },
      role: {
        type: 'string',
        enum: ['USER', 'ADMIN'],
        example: 'USER'
      },
      status: {
        type: 'string',
        enum: ['active', 'inactive'],
        example: 'active'
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-01-19T10:00:00.000Z'
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        example: '2025-01-19T10:00:00.000Z'
      },
      lastLoginAt: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        example: '2025-01-19T10:00:00.000Z'
      }
    },
    required: ['id', 'username', 'firstName', 'lastName', 'departmentId', 'role', 'status', 'createdAt']
  },
  Department: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        example: 1
      },
      name: {
        type: 'string',
        example: 'IT Department'
      },
      status: {
        type: 'string',
        enum: ['active', 'inactive'],
        example: 'active'
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-01-19T10:00:00.000Z'
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        example: '2025-01-19T10:00:00.000Z'
      }
    },
    required: ['id', 'name', 'status', 'createdAt']
  },
  Section: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        example: 1
      },
      departmentId: {
        type: 'integer',
        example: 1
      },
      name: {
        type: 'string',
        example: 'Development Section'
      },
      status: {
        type: 'string',
        enum: ['active', 'inactive'],
        example: 'active'
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-01-19T10:00:00.000Z'
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        example: '2025-01-19T10:00:00.000Z'
      }
    },
    required: ['id', 'departmentId', 'name', 'status', 'createdAt']
  },
  SystemLog: {
    type: 'object',
    properties: {
      datetime: { type: 'string', format: 'date-time', example: '2025-01-21 10:00:00' },
      level: { type: 'string', enum: ['info', 'warn', 'error'], example: 'info' },
      username: { type: 'string', example: 'user01' },
      fullName: { type: 'string', example: 'John Doe' },
      method: { type: 'string', example: 'GET' },
      url: { type: 'string', example: '/users' },
      ip: { type: 'string', example: '127.0.0.1' },
      event: { type: 'string', example: 'GET /users' }
    }
  },
  ImportResult: {
    type: 'object',
    properties: {
      data: {
        type: 'object',
        properties: {
          success: { type: 'integer', example: 10 },
          failed: { type: 'integer', example: 2 },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                row: { type: 'integer', example: 3 },
                code: { type: 'string', example: 'IMPORT_USER_USERNAME_EXISTS' },
                params: { type: 'object' }
              }
            }
          }
        }
      }
    }
  },
  SectionSearch: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, example: 'Dev' },
      departmentId: { type: 'integer', minimum: 1, nullable: true, example: 1 }
    },
    required: ['name']
  },
  UserFromLog: {
    type: 'object',
    properties: {
      username: { type: 'string', example: 'user01' },
      firstName: { type: 'string', example: 'John' },
      lastName: { type: 'string', example: 'Doe' },
      department: { type: 'string', example: 'IT' },
      section: { type: 'string', example: 'Development' }
    }
  }
}
