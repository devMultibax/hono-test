export const MESSAGES = {
    AUTH: {
        MISSING_TOKEN: 'ไม่พบ Token การยืนยันตัวตน',
        UNAUTHORIZED: 'ไม่มีสิทธิ์เข้าถึง',
        LOGOUT_SUCCESS: 'ออกจากระบบสำเร็จ',
        PROFILE_UPDATE_SUCCESS: 'อัปเดตข้อมูลส่วนตัวสำเร็จ',
        PASSWORD_CHANGE_SUCCESS: 'เปลี่ยนรหัสผ่านสำเร็จ',
        LOGIN_SUCCESS: 'เข้าสู่ระบบสำเร็จ',
    },
    USER: {
        NOT_FOUND: 'ไม่พบผู้ใช้งาน',
        INVALID_ID: 'รหัสผู้ใช้งานไม่ถูกต้อง',
        CREATE_SUCCESS: 'สร้างผู้ใช้งานสำเร็จ',
        UPDATE_SUCCESS: 'อัปเดตข้อมูลผู้ใช้งานสำเร็จ',
        DELETE_SUCCESS: 'ลบผู้ใช้งานสำเร็จ',
        PASSWORD_RESET_SUCCESS: 'รีเซ็ตรหัสผ่านสำเร็จ',
        IMPORT_SUCCESS: 'นำเข้าข้อมูลสำเร็จ',
        NO_FILE_UPLOADED: 'ไม่ได้อัปโหลดไฟล์',
        INVALID_FILE_STRUCTURE: 'โครงสร้างไฟล์ไม่ถูกต้อง',
    },
    ERROR: {
        INTERNAL_SERVER_ERROR: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
        BAD_REQUEST: 'คำขอไม่ถูกต้อง',
        NOT_FOUND: 'ไม่พบข้อมูล',
        VALIDATION_ERROR: 'ข้อมูลไม่ถูกต้อง',
        CONFLICT: 'ข้อมูลซ้ำซ้อน',
        RESOURCE_NOT_FOUND: 'ไม่พบข้อมูลที่ร้องขอ',
    },
    COMMON: {
        SUCCESS: 'ทำรายการสำเร็จ',
    },
    DEPARTMENT: {
        INVALID_ID: 'รหัสแผนกไม่ถูกต้อง',
        IMPORT_SUCCESS: 'นำเข้าข้อมูลแผนกสำเร็จ',
    },
    MASTER_DATA: {
        FETCH_DEPARTMENTS_FAILED: 'ไม่สามารถดึงข้อมูลแผนกได้',
        FETCH_SECTIONS_FAILED: 'ไม่สามารถดึงข้อมูลฝ่ายได้',
        SEARCH_SECTIONS_FAILED: 'ไม่สามารถค้นหาข้อมูลฝ่ายได้',
        FETCH_USERS_FAILED: 'ไม่สามารถดึงข้อมูลผู้ใช้งานได้',
        FETCH_USER_LOGS_FAILED: 'ไม่สามารถดึงข้อมูลประวัติผู้ใช้งานได้',
        INVALID_DEPARTMENT_ID: 'รหัสแผนกไม่ถูกต้อง',
    },
    SYSTEM_LOG: {
        CLEANUP_SUCCESS: 'ล้างประวัติการใช้งานเก่าสำเร็จ',
    },
    SYSTEM_SETTINGS: {
        UPDATE_SUCCESS: 'อัปเดตการตั้งค่าระบบสำเร็จ',
        NOT_FOUND: 'ไม่พบการตั้งค่าที่ระบุ',
        MAINTENANCE_ACTIVE: 'ระบบปิดปรับปรุงชั่วคราว กรุณาลองใหม่ภายหลัง',
    },
} as const
