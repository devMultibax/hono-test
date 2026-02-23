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
          description: 'สร้าง Token สำเร็จ',
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
          description: 'เข้าสู่ระบบสำเร็จ',
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
        '401': { description: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '429': { description: 'พยายามเข้าสู่ระบบมากเกินกำหนด', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    }
  },
  '/auth/logout': {
    post: {
      tags: ['Authentication'],
      summary: 'ออกจากระบบ',
      description: 'ออกจากระบบและลบ Session, Cookie',
      security: [{ cookieAuth: [] }],
      responses: {
        '200': {
          description: 'ออกจากระบบสำเร็จ',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'ออกจากระบบสำเร็จ' }
                }
              }
            }
          }
        },
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    }
  },
  '/auth/me': {
    get: {
      tags: ['Authentication'],
      summary: 'ดูข้อมูลโปรไฟล์',
      description: 'ดูข้อมูลผู้ใช้งานปัจจุบัน (ต้องการสิทธิ์การใช้งาน)',
      security: [{ cookieAuth: [] }],
      responses: {
        '200': {
          description: 'ข้อมูลผู้ใช้งาน',
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
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    },
    put: {
      tags: ['Authentication'],
      summary: 'แก้ไขข้อมูลโปรไฟล์',
      description: 'แก้ไขข้อมูลสวนตัว (ชื่อ, นามสกุล, อีเมล, เบอร์โทร)',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                firstName: { type: 'string', minLength: 1, maxLength: 100 },
                lastName: { type: 'string', minLength: 1, maxLength: 100 },
                email: { type: 'string', format: 'email', maxLength: 255, nullable: true },
                tel: { type: 'string', minLength: 10, maxLength: 10, nullable: true }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'แก้ไขข้อมูลสำเร็จ',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'บันทึกข้อมูลสำเร็จ' },
                  user: { $ref: '#/components/schemas/User' }
                }
              }
            }
          }
        },
        '400': { description: 'ข้อมูลไม่ถูกต้อง', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    }
  },
  '/auth/me/password': {
    put: {
      tags: ['Authentication'],
      summary: 'เปลี่ยนรหัสผ่าน',
      description: 'เปลี่ยนรหัสผ่านผู้ใช้งานปัจจุบัน',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['currentPassword', 'newPassword', 'confirmNewPassword'],
              properties: {
                currentPassword: { type: 'string' },
                newPassword: { type: 'string', minLength: 6 },
                confirmNewPassword: { type: 'string', minLength: 6 }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'เปลี่ยนรหัสผ่านสำเร็จ',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'เปลี่ยนรหัสผ่านสำเร็จ' },
                  user: { $ref: '#/components/schemas/User' }
                }
              }
            }
          }
        },
        '400': { description: 'รหัสผ่านไม่ถูกต้อง', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    }
  },
  '/users': {
    get: {
      tags: ['Users'],
      summary: 'ดึงข้อมูลผู้ใช้งานทั้งหมด',
      description: 'ดึงข้อมูลรายการผู้ใช้งานทั้งหมด (ต้องการสิทธิ์การใช้งาน)',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'include',
          in: 'query',
          schema: { type: 'boolean' },
          description: 'รวมข้อมูลแผนกและฝ่าย'
        }
      ],
      responses: {
        '200': {
          description: 'รายการผู้ใช้งาน',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/User' }
              }
            }
          }
        },
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    },
    post: {
      tags: ['Users'],
      summary: 'สร้างผู้ใช้งานใหม่',
      description: 'สร้างบัญชีผู้ใช้งานใหม่ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      security: [{ cookieAuth: [] }],
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
                firstName: { type: 'string', minLength: 1, maxLength: 100, example: 'สมชาย' },
                lastName: { type: 'string', minLength: 1, maxLength: 100, example: 'ใจดี' },
                departmentId: { type: 'integer', minimum: 1, example: 1 },
                sectionId: { type: 'integer', minimum: 1, nullable: true, example: 1 },
                email: { type: 'string', format: 'email', maxLength: 255, nullable: true, example: 'somchai@example.com' },
                tel: { type: 'string', minLength: 10, maxLength: 10, pattern: '^[0-9]+$', nullable: true, example: '0812345678' },
                role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'สร้างผู้ใช้งานสำเร็จ',
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
        '400': { description: 'ข้อมูลไม่ถูกต้อง', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '403': { description: 'ไม่มีสิทธิ์ (ต้องการสิทธิ์ผู้ดูแลระบบ)', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '409': { description: 'ชื่อผู้ใช้งานซ้ำ', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    }
  },
  '/users/export/excel': {
    get: {
      tags: ['Users'],
      summary: 'ส่งออกข้อมูลผู้ใช้งานเป็น Excel',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'ค้นหา' },
        { name: 'departmentId', in: 'query', schema: { type: 'integer' }, description: 'รหัสแผนก' },
        { name: 'sectionId', in: 'query', schema: { type: 'integer' }, description: 'รหัสฝ่าย' },
        { name: 'role', in: 'query', schema: { type: 'string' }, description: 'บทบาท' },
        { name: 'status', in: 'query', schema: { type: 'string' }, description: 'สถานะ' }
      ],
      responses: {
        '200': {
          description: 'ไฟล์ Excel',
          content: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
              schema: { type: 'string', format: 'binary' }
            }
          }
        },
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง' }
      }
    }
  },
  '/users/export/pdf': {
    get: {
      tags: ['Users'],
      summary: 'ส่งออกข้อมูลผู้ใช้งานเป็น PDF',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'ค้นหา' },
        { name: 'departmentId', in: 'query', schema: { type: 'integer' }, description: 'รหัสแผนก' },
        { name: 'sectionId', in: 'query', schema: { type: 'integer' }, description: 'รหัสฝ่าย' },
        { name: 'role', in: 'query', schema: { type: 'string' }, description: 'บทบาท' },
        { name: 'status', in: 'query', schema: { type: 'string' }, description: 'สถานะ' }
      ],
      responses: {
        '200': {
          description: 'ไฟล์ PDF',
          content: {
            'application/pdf': {
              schema: { type: 'string', format: 'binary' }
            }
          }
        },
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง' }
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
          description: 'ข้อมูลผู้ใช้งาน',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' }
            }
          }
        },
        '400': { description: 'รหัสผู้ใช้งานไม่ถูกต้อง', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '404': { description: 'ไม่พบผู้ใช้งาน', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
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
  '/departments/import': {
    post: {
      tags: ['Departments'],
      summary: 'นำเข้าข้อมูลแผนกจาก Excel',
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
          description: 'นำเข้าข้อมูลสำเร็จ',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ImportResult' }
            }
          }
        },
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง' },
        '403': { description: 'ไม่มีสิทธิ์ (ต้องการสิทธิ์ผู้ดูแลระบบ)' }
      }
    }
  },
  '/departments/export/excel': {
    get: {
      tags: ['Departments'],
      summary: 'ส่งออกข้อมูลแผนกเป็น Excel',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'ค้นหา' },
        { name: 'status', in: 'query', schema: { type: 'string' }, description: 'สถานะ' }
      ],
      responses: {
        '200': {
          description: 'ไฟล์ Excel',
          content: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
              schema: { type: 'string', format: 'binary' }
            }
          }
        },
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง' }
      }
    }
  },
  '/departments/export/pdf': {
    get: {
      tags: ['Departments'],
      summary: 'ส่งออกข้อมูลแผนกเป็น PDF',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'ค้นหา' },
        { name: 'status', in: 'query', schema: { type: 'string' }, description: 'สถานะ' }
      ],
      responses: {
        '200': {
          description: 'ไฟล์ PDF',
          content: {
            'application/pdf': {
              schema: { type: 'string', format: 'binary' }
            }
          }
        },
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง' }
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
          description: 'ข้อมูลแผนก',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Department' }
            }
          }
        },
        '400': { description: 'รหัสแผนกไม่ถูกต้อง', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '404': { description: 'ไม่พบแผนก', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
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
          description: 'อัปเดตข้อมูลแผนกสำเร็จ',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Department' }
            }
          }
        },
        '400': { description: 'ข้อมูลไม่ถูกต้อง', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '403': { description: 'ไม่มีสิทธิ์ (ต้องการสิทธิ์ผู้ดูแลระบบ)', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '404': { description: 'ไม่พบแผนก', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
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
        '204': { description: 'ลบแผนกสำเร็จ' },
        '400': { description: 'รหัสแผนกไม่ถูกต้อง', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '403': { description: 'ไม่มีสิทธิ์ (ต้องการสิทธิ์ผู้ดูแลระบบ)', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '404': { description: 'ไม่พบแผนก', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    }
  },
  '/sections': {
    get: {
      tags: ['Sections'],
      summary: 'ดึงข้อมูลฝ่ายทั้งหมด',
      description: 'ดึงข้อมูลรายการฝ่ายทั้งหมด หรือกรองตามแผนก (ต้องการสิทธิ์การใช้งาน)',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'include',
          in: 'query',
          schema: { type: 'boolean' },
          description: 'รวมข้อมูลแผนก'
        },
        {
          name: 'departmentId',
          in: 'query',
          schema: { type: 'integer' },
          description: 'กรองตามรหัสแผนก'
        }
      ],
      responses: {
        '200': {
          description: 'รายการฝ่าย',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Section' }
              }
            }
          }
        },
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    },
    post: {
      tags: ['Sections'],
      summary: 'สร้างฝ่ายใหม่',
      description: 'สร้างข้อมูลฝ่ายใหม่ (ต้องการสิทธิ์ผู้ดูแลระบบ)',
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
          description: 'สร้างฝ่ายสำเร็จ',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Section' }
            }
          }
        },
        '400': { description: 'ข้อมูลไม่ถูกต้อง', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '403': { description: 'ไม่มีสิทธิ์ (ต้องการสิทธิ์ผู้ดูแลระบบ)', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    }
  },
  '/sections/{id}': {
    get: {
      tags: ['Sections'],
      summary: 'ดึงข้อมูลฝ่ายตามรหัส',
      description: 'ดึงข้อมูลฝ่ายที่ระบุ (ต้องการสิทธิ์การใช้งาน)',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          description: 'รหัสฝ่าย',
          example: 1
        },
        {
          name: 'include',
          in: 'query',
          schema: { type: 'boolean' },
          description: 'รวมข้อมูลแผนก'
        }
      ],
      responses: {
        '200': {
          description: 'ข้อมูลฝ่าย',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Section' }
            }
          }
        },
        '400': { description: 'รหัสฝ่ายไม่ถูกต้อง', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '404': { description: 'ไม่พบฝ่าย', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    },
    put: {
      tags: ['Sections'],
      summary: 'อัปเดตข้อมูลฝ่าย',
      description: 'แก้ไขข้อมูลฝ่าย (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          description: 'รหัสฝ่าย',
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
          description: 'อัปเดตข้อมูลฝ่ายสำเร็จ',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Section' }
            }
          }
        },
        '400': { description: 'ข้อมูลไม่ถูกต้อง', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '403': { description: 'ไม่มีสิทธิ์ (ต้องการสิทธิ์ผู้ดูแลระบบ)', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '404': { description: 'ไม่พบฝ่าย', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    },
    delete: {
      tags: ['Sections'],
      summary: 'ลบฝ่าย',
      description: 'ลบข้อมูลฝ่าย (ต้องการสิทธิ์ผู้ดูแลระบบ)',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          description: 'รหัสฝ่าย',
          example: 1
        }
      ],
      responses: {
        '204': { description: 'ลบฝ่ายสำเร็จ' },
        '400': { description: 'รหัสฝ่ายไม่ถูกต้อง', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '403': { description: 'ไม่มีสิทธิ์ (ต้องการสิทธิ์ผู้ดูแลระบบ)', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        '404': { description: 'ไม่พบฝ่าย', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    }
  },
  '/sections/export/excel': {
    get: {
      tags: ['Sections'],
      summary: 'ส่งออกข้อมูลฝ่ายเป็น Excel',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'ค้นหา' },
        { name: 'departmentId', in: 'query', schema: { type: 'integer' }, description: 'รหัสแผนก' },
        { name: 'status', in: 'query', schema: { type: 'string' }, description: 'สถานะ' }
      ],
      responses: {
        '200': {
          description: 'ไฟล์ Excel',
          content: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
              schema: { type: 'string', format: 'binary' }
            }
          }
        },
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง' }
      }
    }
  },
  '/sections/export/pdf': {
    get: {
      tags: ['Sections'],
      summary: 'ส่งออกข้อมูลฝ่ายเป็น PDF',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'ค้นหา' },
        { name: 'departmentId', in: 'query', schema: { type: 'integer' }, description: 'รหัสแผนก' },
        { name: 'status', in: 'query', schema: { type: 'string' }, description: 'สถานะ' }
      ],
      responses: {
        '200': {
          description: 'ไฟล์ PDF',
          content: {
            'application/pdf': {
              schema: { type: 'string', format: 'binary' }
            }
          }
        },
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง' }
      }
    }
  },
  '/sections/import': {
    post: {
      tags: ['Sections'],
      summary: 'นำเข้าข้อมูลฝ่ายจาก Excel',
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
          description: 'นำเข้าข้อมูลสำเร็จ',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ImportResult' }
            }
          }
        },
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง' },
        '403': { description: 'ไม่มีสิทธิ์ (ต้องการสิทธิ์ผู้ดูแลระบบ)' }
      }
    }
  },
  '/master-data/departments': {
    get: {
      tags: ['Master Data'],
      summary: 'ดึงข้อมูลแผนกทั้งหมด (แบบย่อ)',
      security: [{ cookieAuth: [] }],
      responses: {
        '200': {
          description: 'รายการแผนก',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
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
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง' }
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
          description: 'รหัสแผนก'
        }
      ],
      responses: {
        '200': {
          description: 'รายการฝ่าย',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
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
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง' }
      }
    }
  },
  '/master-data/departments/sections/search': {
    post: {
      tags: ['Master Data'],
      summary: 'ค้นหาฝ่าย',
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
          description: 'ผลการค้นหา',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
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
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง' }
      }
    }
  },
  '/master-data/users': {
    get: {
      tags: ['Master Data'],
      summary: 'ดึงข้อมูลผู้ใช้งานทั้งหมด (แบบย่อ)',
      security: [{ cookieAuth: [] }],
      responses: {
        '200': {
          description: 'รายการผู้ใช้งาน',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
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
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง' }
      }
    }
  },
  '/master-data/users/from-logs': {
    get: {
      tags: ['Master Data'],
      summary: 'ดึงข้อมูลผู้ใช้งานจาก Logs',
      security: [{ cookieAuth: [] }],
      responses: {
        '200': {
          description: 'รายการผู้ใช้งานจาก Logs',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/UserFromLog' }
                  }
                }
              }
            }
          }
        },
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง' }
      }
    }
  },
  '/system-log': {
    get: {
      tags: ['System Logs'],
      summary: 'ดึงข้อมูลประวัติการใช้งาน',
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
          description: 'ประวัติการใช้งาน',
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
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง' },
        '403': { description: 'ไม่มีสิทธิ์ (ต้องการสิทธิ์ผู้ดูแลระบบ)' }
      }
    }
  },
  '/system-log/files': {
    get: {
      tags: ['System Logs'],
      summary: 'ดึงรายชื่อไฟล์ log',
      security: [{ cookieAuth: [] }],
      responses: {
        '200': {
          description: 'รายชื่อไฟล์ log',
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
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง' },
        '403': { description: 'ไม่มีสิทธิ์ (ต้องการสิทธิ์ผู้ดูแลระบบ)' }
      }
    }
  },
  '/system-log/cleanup': {
    delete: {
      tags: ['System Logs'],
      summary: 'ล้างประวัติการใช้งานเก่า',
      security: [{ cookieAuth: [] }],
      responses: {
        '200': {
          description: 'ผลการล้างข้อมูล',
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
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง' },
        '403': { description: 'ไม่มีสิทธิ์ (ต้องการสิทธิ์ผู้ดูแลระบบ)' }
      }
    }
  },
  '/users/import': {
    post: {
      tags: ['Users'],
      summary: 'นำเข้าข้อมูลผู้ใช้งานจาก Excel',
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
          description: 'นำเข้าข้อมูลสำเร็จ',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ImportResult' }
            }
          }
        },
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง' },
        '403': { description: 'ไม่มีสิทธิ์ (ต้องการสิทธิ์ผู้ดูแลระบบ)' }
      }
    }
  },
  '/users/password/verify': {
    post: {
      tags: ['Users'],
      summary: 'ตรวจสอบรหัสผ่านปัจจุบัน',
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
          description: 'ผลการตรวจสอบ',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: {
                    type: 'object',
                    properties: { valid: { type: 'boolean' } }
                  }
                }
              }
            }
          }
        },
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง' }
      }
    }
  },
  '/users/{id}/password/reset': {
    patch: {
      tags: ['Users'],
      summary: 'รีเซ็ตรหัสผ่านผู้ใช้งาน (Admin)',
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
          description: 'รีเซ็ตรหัสผ่านสำเร็จ',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: {
                    type: 'object',
                    properties: { user: { $ref: '#/components/schemas/User' } }
                  }
                }
              }
            }
          }
        },
        '401': { description: 'ไม่มีสิทธิ์เข้าถึง' },
        '403': { description: 'ไม่มีสิทธิ์ (ต้องการสิทธิ์ผู้ดูแลระบบ)' }
      }
    }
  }
}
