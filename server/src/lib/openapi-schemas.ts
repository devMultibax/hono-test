/**
 * OpenAPI component schemas
 * Contains all data model definitions for documentation
 */

export const OPENAPI_SCHEMAS = {
  Error: {
    type: 'object',
    properties: {
      error: {
        type: 'string',
        example: 'Error message'
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
      level: { type: 'string', example: 'info' },
      time: { type: 'string', format: 'date-time', example: '2025-01-21T10:00:00.000Z' },
      pid: { type: 'integer', example: 1234 },
      hostname: { type: 'string', example: 'server-01' },
      msg: { type: 'string', example: 'Request completed' },
      reqId: { type: 'string', example: 'req-123' },
      req: { type: 'object' },
      res: { type: 'object' },
      responseTime: { type: 'number', example: 45.2 }
    }
  },
  ImportResult: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Import completed' },
      result: {
        type: 'object',
        properties: {
          success: { type: 'integer', example: 10 },
          failed: { type: 'integer', example: 2 },
          errors: {
            type: 'array',
            items: { type: 'string' },
            example: ['Row 3: Invalid email', 'Row 5: Username exists']
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
