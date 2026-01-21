/**
 * OpenAPI paths/endpoints definitions
 * Contains all API endpoint specifications for documentation
 */

export const OPENAPI_PATHS = {
  '/health': {
    get: {
      tags: ['Health'],
      summary: 'Health check',
      description: 'Check if the server is running',
      responses: {
        '200': {
          description: 'Server is healthy',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ok' },
                  timestamp: { type: 'string', example: '2025-01-19T10:00:00.000Z' },
                  uptime: { type: 'number', example: 123.456 }
                }
              }
            }
          }
        }
      }
    }
  },
  '/auth/csrf-token': {
    get: {
      tags: ['Authentication'],
      summary: 'Get CSRF token',
      description: 'Generate and return a CSRF token for form submissions',
      responses: {
        '200': {
          description: 'CSRF token generated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  csrfToken: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/auth/register': {
    post: {
      tags: ['Authentication'],
      summary: 'Register new user',
      description: 'Create a new user account (requires CSRF token)',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['username', 'password', 'firstName', 'lastName', 'departmentId'],
              properties: {
                username: { type: 'string', minLength: 6, maxLength: 6, pattern: '^[a-zA-Z0-9]+$', example: 'user01' },
                password: { type: 'string', minLength: 6, maxLength: 255, example: 'password123' },
                firstName: { type: 'string', minLength: 1, maxLength: 100, example: 'John' },
                lastName: { type: 'string', minLength: 1, maxLength: 100, example: 'Doe' },
                departmentId: { type: 'integer', minimum: 1, example: 1 },
                sectionId: { type: 'integer', minimum: 1, nullable: true, example: 1 },
                email: { type: 'string', format: 'email', maxLength: 255, nullable: true, example: 'john@example.com' },
                tel: { type: 'string', minLength: 10, maxLength: 10, pattern: '^[0-9]+$', nullable: true, example: '0812345678' },
                role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'User registered successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  user: { $ref: '#/components/schemas/User' }
                }
              }
            }
          }
        },
        '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '409': { description: 'Username already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    }
  },
  '/auth/login': {
    post: {
      tags: ['Authentication'],
      summary: 'User login',
      description: 'Authenticate user and create session (requires CSRF token, rate limited)',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['username', 'password'],
              properties: {
                username: { type: 'string', minLength: 6, maxLength: 6, example: 'user01' },
                password: { type: 'string', minLength: 1, example: 'password123' }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  user: { $ref: '#/components/schemas/User' }
                }
              }
            }
          }
        },
        '401': { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '429': { description: 'Too many login attempts', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    }
  },
  '/auth/logout': {
    post: {
      tags: ['Authentication'],
      summary: 'User logout',
      description: 'Logout user and clear session',
      security: [{ cookieAuth: [] }],
      responses: {
        '200': {
          description: 'Logout successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Logged out successfully' }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    }
  },
  '/users': {
    get: {
      tags: ['Users'],
      summary: 'Get all users',
      description: 'Retrieve list of all users (requires authentication)',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'include',
          in: 'query',
          schema: { type: 'boolean' },
          description: 'Include related department and section data'
        }
      ],
      responses: {
        '200': {
          description: 'List of users',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/User' }
              }
            }
          }
        },
        '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    }
  },
  '/users/{id}': {
    get: {
      tags: ['Users'],
      summary: 'Get user by ID',
      description: 'Retrieve a specific user (requires authentication)',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          description: 'User ID',
          example: 1
        },
        {
          name: 'include',
          in: 'query',
          schema: { type: 'boolean' },
          description: 'Include related department and section data'
        }
      ],
      responses: {
        '200': {
          description: 'User details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' }
            }
          }
        },
        '400': { description: 'Invalid user ID', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '404': { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    },
    put: {
      tags: ['Users'],
      summary: 'Update user',
      description: 'Update user information (requires admin role)',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          description: 'User ID',
          example: 1
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                password: { type: 'string', minLength: 6, maxLength: 255 },
                firstName: { type: 'string', minLength: 1, maxLength: 100 },
                lastName: { type: 'string', minLength: 1, maxLength: 100 },
                departmentId: { type: 'integer', minimum: 1 },
                sectionId: { type: 'integer', minimum: 1, nullable: true },
                email: { type: 'string', format: 'email', maxLength: 255, nullable: true },
                tel: { type: 'string', minLength: 10, maxLength: 10, pattern: '^[0-9]+$', nullable: true },
                role: { type: 'string', enum: ['USER', 'ADMIN'] },
                status: { type: 'string', enum: ['active', 'inactive'] }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'User updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' }
            }
          }
        },
        '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '403': { description: 'Forbidden - Admin role required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '404': { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    },
    delete: {
      tags: ['Users'],
      summary: 'Delete user',
      description: 'Delete a user (requires admin role)',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          description: 'User ID',
          example: 1
        }
      ],
      responses: {
        '204': { description: 'User deleted successfully' },
        '400': { description: 'Invalid user ID', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '403': { description: 'Forbidden - Admin role required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '404': { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    }
  },
  '/departments': {
    get: {
      tags: ['Departments'],
      summary: 'Get all departments',
      description: 'Retrieve list of all departments (requires authentication)',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'include',
          in: 'query',
          schema: { type: 'boolean' },
          description: 'Include related sections data'
        }
      ],
      responses: {
        '200': {
          description: 'List of departments',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Department' }
              }
            }
          }
        },
        '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    },
    post: {
      tags: ['Departments'],
      summary: 'Create department',
      description: 'Create a new department (requires admin role)',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name'],
              properties: {
                name: { type: 'string', minLength: 1, maxLength: 100, example: 'IT Department' }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Department created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Department' }
            }
          }
        },
        '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '403': { description: 'Forbidden - Admin role required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    }
  },
  '/departments/{id}': {
    get: {
      tags: ['Departments'],
      summary: 'Get department by ID',
      description: 'Retrieve a specific department (requires authentication)',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          description: 'Department ID',
          example: 1
        },
        {
          name: 'include',
          in: 'query',
          schema: { type: 'boolean' },
          description: 'Include related sections data'
        }
      ],
      responses: {
        '200': {
          description: 'Department details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Department' }
            }
          }
        },
        '400': { description: 'Invalid department ID', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '404': { description: 'Department not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    },
    put: {
      tags: ['Departments'],
      summary: 'Update department',
      description: 'Update department information (requires admin role)',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          description: 'Department ID',
          example: 1
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string', minLength: 1, maxLength: 100 },
                status: { type: 'string', enum: ['active', 'inactive'] }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Department updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Department' }
            }
          }
        },
        '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '403': { description: 'Forbidden - Admin role required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '404': { description: 'Department not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    },
    delete: {
      tags: ['Departments'],
      summary: 'Delete department',
      description: 'Delete a department (requires admin role)',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          description: 'Department ID',
          example: 1
        }
      ],
      responses: {
        '204': { description: 'Department deleted successfully' },
        '400': { description: 'Invalid department ID', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '403': { description: 'Forbidden - Admin role required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '404': { description: 'Department not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    }
  },
  '/sections': {
    get: {
      tags: ['Sections'],
      summary: 'Get all sections',
      description: 'Retrieve list of all sections or filter by department (requires authentication)',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'include',
          in: 'query',
          schema: { type: 'boolean' },
          description: 'Include related department data'
        },
        {
          name: 'departmentId',
          in: 'query',
          schema: { type: 'integer' },
          description: 'Filter sections by department ID'
        }
      ],
      responses: {
        '200': {
          description: 'List of sections',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Section' }
              }
            }
          }
        },
        '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    },
    post: {
      tags: ['Sections'],
      summary: 'Create section',
      description: 'Create a new section (requires admin role)',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['departmentId', 'name'],
              properties: {
                departmentId: { type: 'integer', minimum: 1, example: 1 },
                name: { type: 'string', minLength: 1, maxLength: 100, example: 'Development Section' }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Section created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Section' }
            }
          }
        },
        '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '403': { description: 'Forbidden - Admin role required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    }
  },
  '/sections/{id}': {
    get: {
      tags: ['Sections'],
      summary: 'Get section by ID',
      description: 'Retrieve a specific section (requires authentication)',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          description: 'Section ID',
          example: 1
        },
        {
          name: 'include',
          in: 'query',
          schema: { type: 'boolean' },
          description: 'Include related department data'
        }
      ],
      responses: {
        '200': {
          description: 'Section details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Section' }
            }
          }
        },
        '400': { description: 'Invalid section ID', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '404': { description: 'Section not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    },
    put: {
      tags: ['Sections'],
      summary: 'Update section',
      description: 'Update section information (requires admin role)',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          description: 'Section ID',
          example: 1
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                departmentId: { type: 'integer', minimum: 1 },
                name: { type: 'string', minLength: 1, maxLength: 100 },
                status: { type: 'string', enum: ['active', 'inactive'] }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Section updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Section' }
            }
          }
        },
        '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '403': { description: 'Forbidden - Admin role required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '404': { description: 'Section not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    },
    delete: {
      tags: ['Sections'],
      summary: 'Delete section',
      description: 'Delete a section (requires admin role)',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          description: 'Section ID',
          example: 1
        }
      ],
      responses: {
        '204': { description: 'Section deleted successfully' },
        '400': { description: 'Invalid section ID', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '403': { description: 'Forbidden - Admin role required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '404': { description: 'Section not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    }
  },
  '/master-data/departments': {
    get: {
      tags: ['Master Data'],
      summary: 'Get all departments (simplified)',
      security: [{ cookieAuth: [] }],
      responses: {
        '200': {
          description: 'List of departments',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        status: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/master-data/departments/{id}/sections': {
    get: {
      tags: ['Master Data'],
      summary: 'Get sections by department ID',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          description: 'Department ID'
        }
      ],
      responses: {
        '200': {
          description: 'List of sections',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        departmentId: { type: 'integer' },
                        status: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/master-data/departments/sections/search': {
    post: {
      tags: ['Master Data'],
      summary: 'Search sections',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SectionSearch' }
          }
        }
      },
      responses: {
        '200': {
          description: 'Search results',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        departmentId: { type: 'integer' },
                        status: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/master-data/users': {
    get: {
      tags: ['Master Data'],
      summary: 'Get all users (simplified)',
      security: [{ cookieAuth: [] }],
      responses: {
        '200': {
          description: 'List of users',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        username: { type: 'string' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        departmentId: { type: 'integer' },
                        role: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/master-data/users/from-logs': {
    get: {
      tags: ['Master Data'],
      summary: 'Get users from logs',
      security: [{ cookieAuth: [] }],
      responses: {
        '200': {
          description: 'List of users from logs',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/UserFromLog' }
                  }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/system-log': {
    get: {
      tags: ['System Logs'],
      summary: 'Get system logs',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
        { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
        { name: 'level', in: 'query', schema: { type: 'string' } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } }
      ],
      responses: {
        '200': {
          description: 'System logs',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  logs: { type: 'array', items: { $ref: '#/components/schemas/SystemLog' } },
                  total: { type: 'integer' }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden' }
      }
    }
  },
  '/system-log/files': {
    get: {
      tags: ['System Logs'],
      summary: 'Get log files',
      security: [{ cookieAuth: [] }],
      responses: {
        '200': {
          description: 'List of log files',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  files: { type: 'array', items: { type: 'string' } },
                  total: { type: 'integer' }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden' }
      }
    }
  },
  '/system-log/cleanup': {
    delete: {
      tags: ['System Logs'],
      summary: 'Cleanup old logs',
      security: [{ cookieAuth: [] }],
      responses: {
        '200': {
          description: 'Cleanup result',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  deletedCount: { type: 'integer' }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden' }
      }
    }
  },
  '/users/import': {
    post: {
      tags: ['Users'],
      summary: 'Import users from Excel',
      security: [{ cookieAuth: [] }],
      requestBody: {
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                file: { type: 'string', format: 'binary' }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Import result',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ImportResult' }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden' }
      }
    }
  },
  '/users/password/verify': {
    post: {
      tags: ['Users'],
      summary: 'Verify password',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: { password: { type: 'string' } },
              required: ['password']
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Verification result',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: { valid: { type: 'boolean' } }
                  }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/users/{id}/password/reset': {
    patch: {
      tags: ['Users'],
      summary: 'Reset user password',
      security: [{ cookieAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: { newPassword: { type: 'string' } },
              required: ['newPassword']
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Password reset successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: { user: { $ref: '#/components/schemas/User' } }
                  }
                }
              }
            }
          }
        },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden' }
      }
    }
  }
}
