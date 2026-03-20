// ─── Centralized Thai Message Constants ───────────────────────────────────────
// Single source of truth for all Thai-language strings used in the backend.
// Grouped into 3 namespaces: validation, export, template.

export const MSG = {
  // ── Zod validation messages, grouped by field ─────────────────────────────
  validation: {
    username: {
      required: 'กรุณาระบุรหัสพนักงาน',
      length: 'รหัสพนักงานต้องมี 6 หลักพอดี',
      format: 'รหัสพนักงานต้องเป็นตัวเลข 6 หลัก',
    },
    firstName: {
      required: 'กรุณาระบุชื่อ',
      maxLength: 'ชื่อต้องไม่เกิน 100 ตัวอักษร',
    },
    lastName: {
      required: 'กรุณาระบุนามสกุล',
      maxLength: 'นามสกุลต้องไม่เกิน 100 ตัวอักษร',
    },
    email: {
      format: 'รูปแบบอีเมลไม่ถูกต้อง',
      maxLength: 'อีเมลต้องไม่เกิน 255 ตัวอักษร',
    },
    tel: {
      length: 'เบอร์โทรศัพท์ต้องมี 10 หลักพอดี',
      format: 'เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้น',
    },
    password: {
      required: 'กรุณาระบุรหัสผ่าน',
      currentRequired: 'กรุณาระบุรหัสผ่านปัจจุบัน',
      newRequired: 'กรุณาระบุรหัสผ่านใหม่',
      minLength: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
      maxLength: 'รหัสผ่านต้องไม่เกิน 255 ตัวอักษร',
    },
    role: {
      invalid: 'สิทธิ์ไม่ถูกต้อง',
    },
    status: {
      invalid: 'สถานะไม่ถูกต้อง',
    },
    departmentId: {
      required: 'กรุณาระบุรหัสฝ่าย',
      typeError: 'รหัสฝ่ายต้องเป็นตัวเลข',
      int: 'รหัสฝ่ายต้องเป็นจำนวนเต็ม',
      positive: 'รหัสฝ่ายต้องเป็นจำนวนบวก',
    },
    sectionId: {
      typeError: 'รหัสแผนกต้องเป็นตัวเลข',
      int: 'รหัสแผนกต้องเป็นจำนวนเต็ม',
      positive: 'รหัสแผนกต้องเป็นจำนวนบวก',
    },
    departmentName: {
      required: 'กรุณาระบุชื่อฝ่าย',
      maxLength: 'ชื่อฝ่ายต้องไม่เกิน 100 ตัวอักษร',
    },
    sectionName: {
      required: 'กรุณาระบุชื่อแผนก',
      maxLength: 'ชื่อแผนกต้องไม่เกิน 100 ตัวอักษร',
      textType: 'ชื่อแผนกต้องเป็นข้อความ',
    },
    systemSetting: {
      valueRequired: 'กรุณาระบุค่า',
    },
    changelog: {
      titleRequired: 'กรุณาระบุหัวข้อ',
      titleMaxLength: 'หัวข้อต้องไม่เกิน 200 ตัวอักษร',
      updateTypeInvalid: 'ประเภทการอัปเดตไม่ถูกต้อง',
      updatedDateRequired: 'กรุณาระบุวันที่อัปเดต',
    },
  },

  // ── Excel export column headers ────────────────────────────────────────────
  export: {
    user: {
      username: 'รหัสพนักงาน',
      firstName: 'ชื่อ',
      lastName: 'นามสกุล',
      department: 'ฝ่าย',
      section: 'หน่วยงาน',
      email: 'อีเมล',
      tel: 'เบอร์โทร',
      role: 'สิทธิ์',
      status: 'สถานะ',
      lastLoginAt: 'เข้าสู่ระบบล่าสุด',
    },
    department: {
      name: 'ชื่อฝ่าย',
      status: 'สถานะ',
    },
    section: {
      department: 'ชื่อฝ่าย',
      name: 'ชื่อหน่วยงาน',
      status: 'สถานะ',
    },
    common: {
      createdAt: 'วันที่สร้าง',
      createdBy: 'สร้างโดย',
      updatedAt: 'วันที่แก้ไข',
      updatedBy: 'แก้ไขโดย',
    },
    values: {
      role: {
        USER: 'ผู้ใช้',
        ADMIN: 'ผู้ดูแลระบบ',
      },
      status: {
        active: 'ใช้งาน',
        inactive: 'ไม่ใช้งาน',
      },
    },
  },

  // ── Excel import template content ──────────────────────────────────────────
  template: {
    worksheetName: 'คำอธิบาย',
    headers: {
      column: 'คอลัมน์',
      required: 'จำเป็น',
      description: 'คำอธิบาย',
      example: 'ตัวอย่าง',
      rules: 'เงื่อนไข',
    },
    required: {
      yes: 'ใช่' as const,
      no: 'ไม่' as const,
    },
    cellNotes: {
      required: '\n\n⚠️ จำเป็นต้องกรอก',
      optional: '\n\nไม่จำเป็นต้องกรอก',
      exampleRow:
        '⚠️ นี่คือแถวตัวอย่าง กรุณาลบออกก่อนนำเข้าข้อมูลจริง\n\nคลิกที่ตัวเลขแถว (2) ด้านซ้ายแล้วกด Delete',
    },
    legend: {
      title: 'คำอธิบายสัญลักษณ์',
      requiredPrefix: '⬤ คอลัมน์สีแดง',
      requiredLabel: 'จำเป็นต้องกรอก (Required)',
      optionalPrefix: '⬤ คอลัมน์สีเทา',
      optionalLabel: 'ไม่จำเป็นต้องกรอก (Optional)',
    },
    notes: {
      title: 'หมายเหตุสำคัญ',
      exampleRowPrefix: '⚠️ แถวตัวอย่าง',
      exampleRowText: (sheetName: string) =>
        `แถวที่ 2 ใน sheet "${sheetName}" เป็นตัวอย่าง กรุณาลบออกก่อนนำเข้าข้อมูลจริง`,
      tipPrefix: '💡 วิธีดูคำอธิบาย',
      tipText: (sheetName: string) =>
        `วางเมาส์บนหัวคอลัมน์ใน sheet "${sheetName}" เพื่อดูคำอธิบายเพิ่มเติม`,
    },
    user: {
      columns: {
        username: 'รหัสพนักงาน 6 หลัก (ตัวเลขและตัวอักษร)\nตัวอย่าง: 100001\nต้องไม่ซ้ำกับในระบบและภายในไฟล์',
        firstName: 'ชื่อจริง (ไม่เกิน 100 ตัวอักษร)',
        lastName: 'นามสกุล (ไม่เกิน 100 ตัวอักษร)',
        departmentId: 'รหัสฝ่าย (ตัวเลข)\nดูรหัสได้จากหน้าจัดการฝ่าย',
        sectionId: 'รหัสหน่วยงาน (ตัวเลข)\nดูรหัสได้จากหน้าจัดการหน่วยงาน',
        email: 'อีเมล (รูปแบบ: example@email.com)\nต้องไม่ซ้ำกับในระบบและภายในไฟล์',
        tel: 'เบอร์โทร 10 หลัก (ตัวเลขเท่านั้น)\nตัวอย่าง: 0812345678',
        role: 'สิทธิ์: USER หรือ ADMIN\n(ค่าเริ่มต้น: USER)',
      },
      exampleRow: {
        firstName: 'สมชาย',
        lastName: 'ใจดี',
      },
      instructions: {
        username: {
          description: 'รหัสพนักงาน',
          rules: 'ต้องมี 6 ตัวอักษร, ตัวเลขและตัวอักษรภาษาอังกฤษเท่านั้น, ห้ามซ้ำกับในระบบและภายในไฟล์',
        },
        firstName: {
          description: 'ชื่อจริง',
          rules: 'ไม่เกิน 100 ตัวอักษร',
        },
        lastName: {
          description: 'นามสกุล',
          rules: 'ไม่เกิน 100 ตัวอักษร',
        },
        departmentId: {
          description: 'รหัสฝ่าย',
          rules: 'ต้องเป็นตัวเลขที่มากกว่า 0, ดูรหัสได้จากหน้าจัดการฝ่าย',
        },
        sectionId: {
          description: 'รหัสหน่วยงาน',
          rules: 'ต้องเป็นตัวเลขที่มากกว่า 0 (ถ้ากรอก), ดูรหัสได้จากหน้าจัดการหน่วยงาน',
        },
        email: {
          description: 'อีเมล',
          rules: 'ต้องเป็นรูปแบบอีเมลที่ถูกต้อง, ห้ามซ้ำกับในระบบและภายในไฟล์ (ถ้ากรอก)',
        },
        tel: {
          description: 'เบอร์โทรศัพท์',
          rules: 'ต้องเป็นตัวเลข 10 หลักเท่านั้น (ถ้ากรอก)',
        },
        role: {
          description: 'สิทธิ์การใช้งาน',
          rules: 'ค่าที่รองรับ: USER, ADMIN (ค่าเริ่มต้น: USER)',
        },
      },
      additionalNotes: {
        passwordPrefix: '🔑 รหัสผ่าน',
        passwordText: 'รหัสผ่านจะถูกสร้างอัตโนมัติโดยระบบ',
      },
    },
    department: {
      columns: {
        name: 'ชื่อฝ่าย (ไม่เกิน 100 ตัวอักษร)\nตัวอย่าง: ฝ่ายบริหาร',
      },
      exampleRow: {
        name: 'ฝ่ายบริหาร',
      },
      instructions: {
        name: {
          description: 'ชื่อฝ่าย',
          rules: 'ไม่เกิน 100 ตัวอักษร, ต้องไม่ซ้ำกับชื่อฝ่ายที่มีอยู่',
        },
      },
    },
    section: {
      columns: {
        department: 'ชื่อฝ่าย (ต้องตรงกับชื่อฝ่ายที่มีในระบบ)\nตัวอย่าง: ฝ่ายบริหาร',
        name: 'ชื่อหน่วยงาน (ไม่เกิน 100 ตัวอักษร)\nตัวอย่าง: แผนกบุคคล',
      },
      exampleRow: {
        department: 'ฝ่ายบริหาร',
        name: 'แผนกบุคคล',
      },
      instructions: {
        department: {
          description: 'ชื่อฝ่าย',
          rules: 'ต้องตรงกับชื่อฝ่ายที่มีอยู่ในระบบ (ตัวอักษรต้องตรงกันทุกตัว)',
        },
        name: {
          description: 'ชื่อหน่วยงาน',
          rules: 'ไม่เกิน 100 ตัวอักษร',
        },
      },
      additionalNotes: {
        departmentPrefix: '🔗 ชื่อฝ่าย',
        departmentText: 'ต้องระบุชื่อฝ่ายที่ตรงกับชื่อในระบบ (ดูได้จากหน้าจัดการฝ่าย)',
      },
    },
  },
  // ── Error messages for thrown AppError / subclasses ──────────────────────
  errors: {
    department: {
      notFound:    'ไม่พบข้อมูลแผนก',
      nameExists:  'ชื่อแผนกนี้มีอยู่แล้ว',
      hasUsers:    'ไม่สามารถลบแผนกที่มีผู้ใช้งานได้',
      hasSections: 'ไม่สามารถลบแผนกที่มีแผนกย่อยได้',
    },
    section: {
      notFound:   'ไม่พบข้อมูลแผนกย่อย',
      nameExists: 'ชื่อแผนกย่อยนี้มีอยู่แล้ว',
      hasUsers:   'ไม่สามารถลบแผนกย่อยที่มีผู้ใช้งานได้',
    },
    user: {
      notFound:        'ไม่พบข้อมูลผู้ใช้',
      usernameExists:  'ชื่อผู้ใช้นี้มีอยู่แล้ว',
      emailExists:     'อีเมลนี้มีอยู่แล้วในระบบ',
      invalidPassword: 'รหัสผ่านปัจจุบันไม่ถูกต้อง',
    },
    auth: {
      invalidCredentials: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      accountInactive:    'บัญชีผู้ใช้ถูกระงับการใช้งาน',
      accountDeleted:     'บัญชีผู้ใช้ไม่มีอยู่แล้ว',
      sessionReplaced:    'เซสชันถูกแทนที่ด้วยการเข้าสู่ระบบใหม่',
      invalidToken:       'Token ไม่ถูกต้องหรือหมดอายุ',
    },
    systemSetting: {
      notFound: 'ไม่พบการตั้งค่าระบบ',
    },
    backup: {
      fileNotFound: 'ไม่พบไฟล์ Backup',
    },
    userLog: {
      notFound: 'ไม่พบประวัติการใช้งาน',
    },
    changelog: {
      notFound: 'ไม่พบบันทึกการอัปเดต',
    },
    import: {
      rowLimitExceeded:    'จำนวนแถวเกินกว่าที่อนุญาต',
      processFailed:       'เกิดข้อผิดพลาดในการนำเข้าข้อมูล',
      invalidFileStructure: 'โครงสร้างไฟล์ไม่ถูกต้อง',
    },
    export: {
      rowLimitExceeded: 'จำนวนแถวเกินกว่าที่อนุญาตสำหรับการส่งออก',
    },
    upload: {
      noFile:      'ไม่พบไฟล์ที่อัปโหลด',
      invalidFile: 'ไฟล์ไม่ถูกต้อง',
    },
    masterData: {
      invalidDepartmentId: 'รหัสแผนกไม่ถูกต้อง',
    },
  },
} as const
