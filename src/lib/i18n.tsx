import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

export interface Translations {
  appName: string;
  appSubtitle: string;
  churchName: string;
  roles: {
    admin: string;
    priest: string;
    secretary: string;
    general: string;
  };
  nav: {
    home: string;
    priests: string;
    myAppointments: string;
    priestSchedule: string;
    priestOverrides: string;
    priestAppointments: string;
    priestProfile: string;
    secretaryDashboard: string;
    adminDashboard: string;
    notifications: string;
    login: string;
    logout: string;
    switchRole: string;
    demoRoleSwitcher: string;
  };
  auth: {
    signInTitle: string;
    signInSubtitle: string;
    signUpTitle: string;
    signUpSubtitle: string;
    emailLabel: string;
    passwordLabel: string;
    confirmPasswordLabel: string;
    fullNameLabel: string;
    phoneLabel: string;
    signInButton: string;
    signUpButton: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    passwordsDoNotMatch: string;
    signUpSuccess: string;
    forgotPassword: string;
    resetPasswordPrompt: string;
    invalidCredentials: string;
    nameRequired: string;
    phoneRequired: string;
    passwordMinLength: string;
    welcomeBack: string;
    registerMemberNotice: string;
    signOut: string;
    loggedInAs: string;
    switchAccount: string;
  };
  adminFlow: {
    title: string;
    subtitle: string;
    totalUsers: string;
    totalPriests: string;
    totalSecretaries: string;
    totalMembers: string;
    createUserBtn: string;
    createUserTitle: string;
    editUserTitle: string;
    editRoleBtn: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    userRole: string;
    titleEn: string;
    titleAr: string;
    photoLabel: string;
    uploadPhoto: string;
    orEnterImageUrl: string;
    presetPhotos: string;
    assignPriestsLabel: string;
    assignPriestsHelper: string;
    priestDurationLabel: string;
    priestBioLabel: string;
    allUsersTable: string;
    searchUsers: string;
    filterRole: string;
    deleteUserConfirm: string;
    userCreatedSuccess: string;
    userUpdatedSuccess: string;
    userDeletedSuccess: string;
  };
  common: {
    loading: string;
    save: string;
    saving: string;
    cancel: string;
    confirm: string;
    delete: string;
    edit: string;
    add: string;
    close: string;
    back: string;
    actions: string;
    date: string;
    time: string;
    status: string;
    duration: string;
    minutes: string;
    priest: string;
    user: string;
    notes: string;
    none: string;
    all: string;
    search: string;
    filter: string;
    refresh: string;
    success: string;
    error: string;
    warning: string;
    notice: string;
  };
  status: {
    available: string;
    booked: string;
    unavailable: string;
    confirmed: string;
    cancelled: string;
    completed: string;
    no_show: string;
  };
  days: {
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
  };
  userFlow: {
    selectPriest: string;
    selectPriestDesc: string;
    selectSlot: string;
    selectSlotDesc: string;
    bookWithPriest: string;
    backToPriestsList: string;
    activeBookingWarning: string;
    activeBookingDetails: string;
    mustCancelFirst: string;
    bookSlotTitle: string;
    confirmBookingPrompt: string;
    bookingSuccess: string;
    bookingSuccessDesc: string;
    noSlotsAvailable: string;
    twoHourCutoffWarning: string;
    contactSecretaryToCancel: string;
    secretaryPhone: string;
    secretaryEmail: string;
    cancelBookingTitle: string;
    cancelBookingConfirm: string;
    cancelSuccess: string;
    upcomingAppointment: string;
    pastAppointments: string;
    noUpcomingAppointments: string;
    rollingWindowNotice: string;
  };
  priestFlow: {
    manageSchedule: string;
    manageScheduleDesc: string;
    avgDurationLabel: string;
    avgDurationHelper: string;
    weeklyRecurringSchedule: string;
    addTimeWindow: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    saveScheduleBtn: string;
    regenerateWarningTitle: string;
    regenerateWarningDesc: string;
    scheduleOverridesTitle: string;
    scheduleOverridesDesc: string;
    addOverrideBtn: string;
    overrideDate: string;
    isUnavailableCheckbox: string;
    overrideReason: string;
    blackoutDateNotice: string;
    upcomingConfessions: string;
    noAppointmentsScheduled: string;
    totalSlotsToday: string;
    bookedSlots: string;
    myProfileTitle: string;
    myProfileSubtitle: string;
    churchNameEn: string;
    churchNameAr: string;
    bioEn: string;
    bioAr: string;
    profileUpdatedSuccess: string;
    saveProfileBtn: string;
    smartUpdateTitle: string;
    smartUpdateDesc: string;
    preservedBookingsCount: string;
    cancelledBookingsCount: string;
    noBookingsAffectedNotice: string;
    durationChangeWarning: string;
    newSlotsEstimateNotice: string;
    confirmScheduleUpdateBtn: string;
    markCompletedBtn: string;
    markNoShowBtn: string;
    markCompletedSuccess: string;
    markNoShowSuccess: string;
    totalCompleted: string;
    totalNoShow: string;
  };
  secretaryFlow: {
    overviewTitle: string;
    overviewSubtitle: string;
    myAssignedPriestsTitle: string;
    myAssignedPriestsDesc: string;
    selectPriestToManage: string;
    viewPriestBookingsBtn: string;
    backToAssignedPriests: string;
    allBookingsTitle: string;
    bookOnBehalf: string;
    bookOnBehalfDesc: string;
    selectUserToBook: string;
    filterByPriest: string;
    filterByDate: string;
    filterByStatus: string;
    cancelOnBehalfTitle: string;
    cancelReason: string;
    emergencyOverrideNote: string;
    totalBookings: string;
    upcomingConfirmed: string;
    cancelledTotal: string;
    noAssignedPriests: string;
  };
  notifications: {
    title: string;
    empty: string;
    markAllRead: string;
    emailDispatched: string;
    bookingConfirmedTitle: string;
    bookingCancelledTitle: string;
    scheduleChangedTitle: string;
    priestUnavailableTitle: string;
  };
  cancellationReasons: {
    user_cancelled: string;
    secretary_cancelled: string;
    priest_schedule_change: string;
    priest_unavailable: string;
    completed: string;
    no_show: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    appName: "Confession Scheduling",
    appSubtitle: "Sacrament of Holy Confession Appointment System",
    churchName: "St. George & St. Anthony Coptic Orthodox Church",
    roles: {
      admin: "Super Admin",
      priest: "Priest (Father)",
      secretary: "Church Secretary",
      general: "Church Member",
    },
    nav: {
      home: "Home",
      priests: "Priests",
      myAppointments: "My Appointment",
      priestSchedule: "My Schedule & Duration",
      priestOverrides: "Date Overrides & Blackouts",
      priestAppointments: "Confession Appointments",
      priestProfile: "My Profile",
      secretaryDashboard: "Secretary Operations",
      adminDashboard: "Super Admin",
      notifications: "Notifications",
      login: "Sign In",
      logout: "Sign Out",
      switchRole: "Switch Role",
      demoRoleSwitcher: "Interactive Role Switcher",
    },
    auth: {
      signInTitle: "Sign In to Your Account",
      signInSubtitle: "Sign in with your email and password to access the confession appointment portal.",
      signUpTitle: "Create a New Member Account",
      signUpSubtitle: "Register your details to book and manage confession appointments with Church Fathers.",
      emailLabel: "Email Address",
      passwordLabel: "Password",
      confirmPasswordLabel: "Confirm Password",
      fullNameLabel: "Full Name",
      phoneLabel: "Phone Number",
      signInButton: "Sign In",
      signUpButton: "Create Account",
      alreadyHaveAccount: "Already have an account? Sign in",
      dontHaveAccount: "Don't have an account? Create one",
      passwordsDoNotMatch: "Passwords do not match",
      signUpSuccess: "Account created successfully! Welcome to the Holy Confession portal.",
      forgotPassword: "Forgot Password?",
      resetPasswordPrompt: "Enter your email to receive a password reset link:",
      invalidCredentials: "Invalid email or password. Please try again.",
      nameRequired: "Full Name is required.",
      phoneRequired: "Phone Number is required.",
      passwordMinLength: "Password must be at least 6 characters.",
      welcomeBack: "Welcome back",
      registerMemberNotice: "New accounts are registered as Congregation Members. Priest and Secretary roles are assigned by the Church Administrator.",
      signOut: "Sign Out",
      loggedInAs: "Logged in as",
      switchAccount: "Switch Account",
    },
    adminFlow: {
      title: "Super Admin Control Center",
      subtitle: "Create users, assign roles, configure secretary-priest assignments, and manage system accounts.",
      totalUsers: "Total Users",
      totalPriests: "Priests",
      totalSecretaries: "Secretaries",
      totalMembers: "Congregation Members",
      createUserBtn: "Create New User",
      createUserTitle: "Create System User",
      editUserTitle: "Edit User & Role Assignment",
      editRoleBtn: "Edit Role & Settings",
      userName: "Full Name",
      userEmail: "Email Address",
      userPhone: "Phone Number",
      userRole: "System Role",
      titleEn: "English Title / Label",
      titleAr: "Arabic Title / Label",
      photoLabel: "Profile Photo (Avatar)",
      uploadPhoto: "Upload Photo File",
      orEnterImageUrl: "or enter Image URL",
      presetPhotos: "Or pick a preset portrait",
      assignPriestsLabel: "Assigned Priests (for Secretary)",
      assignPriestsHelper: "Select which priests this secretary is authorized to manage.",
      priestDurationLabel: "Initial Avg Confession Duration (Minutes)",
      priestBioLabel: "Pastoral Bio / Description",
      allUsersTable: "All System Accounts",
      searchUsers: "Search users by name, email, or role...",
      filterRole: "Filter by Role",
      deleteUserConfirm: "Are you sure you want to remove this user from the system?",
      userCreatedSuccess: "User created successfully!",
      userUpdatedSuccess: "User updated successfully!",
      userDeletedSuccess: "User deleted successfully.",
    },
    common: {
      loading: "Loading...",
      save: "Save Changes",
      saving: "Saving...",
      cancel: "Cancel",
      confirm: "Confirm",
      delete: "Delete",
      edit: "Edit",
      add: "Add New",
      close: "Close",
      back: "Back",
      actions: "Actions",
      date: "Date",
      time: "Time",
      status: "Status",
      duration: "Duration",
      minutes: "mins",
      priest: "Priest",
      user: "Member",
      notes: "Notes (Optional)",
      none: "None",
      all: "All",
      search: "Search...",
      filter: "Filter",
      refresh: "Refresh",
      success: "Success",
      error: "Error",
      warning: "Notice",
      notice: "Important Note",
    },
    status: {
      available: "Available",
      booked: "Booked",
      unavailable: "Unavailable",
      confirmed: "Confirmed",
      cancelled: "Cancelled",
      completed: "Completed",
      no_show: "No-Show",
    },
    days: {
      0: "Sunday",
      1: "Monday",
      2: "Tuesday",
      3: "Wednesday",
      4: "Thursday",
      5: "Friday",
      6: "Saturday",
    },
    userFlow: {
      selectPriest: "Spiritual Fathers Available for Confession",
      selectPriestDesc: "Select your Father of Confession to open their appointment booking calendar.",
      selectSlot: "Select an Available Slot",
      selectSlotDesc: "Choose a date and an open slot. Slots are auto-divided according to the priest's average confession duration.",
      bookWithPriest: "Book Confession Slot",
      backToPriestsList: "← Back to Priests List",
      activeBookingWarning: "You already hold an active confirmed appointment.",
      activeBookingDetails: "Rule: You may only hold one active upcoming booking globally across all priests. To choose a different slot, you must complete or cancel your existing booking.",
      mustCancelFirst: "You must cancel your active booking before reserving another.",
      bookSlotTitle: "Confirm Confession Appointment",
      confirmBookingPrompt: "Are you sure you want to reserve this confession slot?",
      bookingSuccess: "Appointment Confirmed!",
      bookingSuccessDesc: "A confirmation email has been dispatched with your appointment details.",
      noSlotsAvailable: "No available slots on this day. Please pick another date.",
      twoHourCutoffWarning: "Cancellations are locked within 2 hours of appointment start time.",
      contactSecretaryToCancel: "Self-service cancellation is blocked within 2 hours of the slot. Please call or contact the Church Secretary for emergency cancellation.",
      secretaryPhone: "+1 (555) 019-2831",
      secretaryEmail: "secretary@church.org",
      cancelBookingTitle: "Cancel Appointment",
      cancelBookingConfirm: "Are you sure you want to cancel your upcoming confession appointment? This will free the slot for other members.",
      cancelSuccess: "Your appointment has been cancelled successfully.",
      upcomingAppointment: "Your Active Confession Appointment",
      pastAppointments: "Past & Cancelled Bookings",
      noUpcomingAppointments: "You do not have any upcoming confession appointments.",
      rollingWindowNotice: "Showing bookable slots for the rolling 14-day window.",
    },
    priestFlow: {
      manageSchedule: "Configure Availability & Confession Duration",
      manageScheduleDesc: "Define your average confession duration and recurring weekly windows. The system automatically divides windows into bookable slots.",
      avgDurationLabel: "Average Confession Duration (Minutes)",
      avgDurationHelper: "Slots are auto-generated by dividing each window by this duration (e.g. 15, 20, 30 min).",
      weeklyRecurringSchedule: "Weekly Recurring Availability",
      addTimeWindow: "Add Time Window",
      dayOfWeek: "Day of Week",
      startTime: "Start Time",
      endTime: "End Time",
      saveScheduleBtn: "Update Schedule & Regenerate Slots",
      regenerateWarningTitle: "Warning: Automatic Slot Regeneration",
      regenerateWarningDesc: "Saving changes will immediately regenerate all future slots. Any existing booked appointments will be automatically cancelled, and affected congregation members will receive an urgent email notice to rebook.",
      scheduleOverridesTitle: "One-Off Date Overrides & Blackouts",
      scheduleOverridesDesc: "Add special extra availability or mark emergency blackout dates (e.g. monastery retreat, feasts, travel).",
      addOverrideBtn: "Add Date Override",
      overrideDate: "Override Date",
      isUnavailableCheckbox: "Mark Father Unavailable (Emergency / Travel Blackout)",
      overrideReason: "Reason / Note (optional)",
      blackoutDateNotice: "Marking a date unavailable will auto-cancel any existing bookings on that day and send email notices.",
      upcomingConfessions: "My Scheduled Confession Appointments",
      noAppointmentsScheduled: "No upcoming confessions scheduled yet.",
      totalSlotsToday: "Slots Today",
      bookedSlots: "Booked",
      myProfileTitle: "My Pastoral Profile & Information",
      myProfileSubtitle: "Update your name, title, contact details, church name, pastoral counseling bio, and portrait photo.",
      churchNameEn: "Church Name (English)",
      churchNameAr: "Church Name (Arabic)",
      bioEn: "Pastoral Counseling Bio (English)",
      bioAr: "Pastoral Counseling Bio (Arabic)",
      profileUpdatedSuccess: "Profile updated successfully! All changes are now live across the portal.",
      saveProfileBtn: "Save Profile Changes",
      smartUpdateTitle: "Schedule Impact Analysis & Confirmation",
      smartUpdateDesc: "Our system analyzed your existing confession appointments against your updated schedule windows.",
      preservedBookingsCount: "Preserved Confirmed Bookings",
      cancelledBookingsCount: "Bookings to be Cancelled",
      noBookingsAffectedNotice: "Great news! None of your existing appointments will be affected. All current member bookings remain confirmed.",
      durationChangeWarning: "Notice: Changing average confession duration shifts all slot boundaries across all days and will cancel future bookings.",
      newSlotsEstimateNotice: "New confession slots will be generated and made available immediately on the 14-day calendar.",
      confirmScheduleUpdateBtn: "Confirm & Apply Schedule",
      markCompletedBtn: "Mark as Completed",
      markNoShowBtn: "Mark as No-Show",
      markCompletedSuccess: "Confession marked as completed. Member's active booking restriction is now released.",
      markNoShowSuccess: "Confession marked as No-Show. Slot archived.",
      totalCompleted: "Completed",
      totalNoShow: "No-Show",
    },
    secretaryFlow: {
      overviewTitle: "Church Secretary Operations Center",
      overviewSubtitle: "Select one of your assigned Spiritual Fathers below to view and manage all their confession bookings.",
      myAssignedPriestsTitle: "My Assigned Spiritual Fathers",
      myAssignedPriestsDesc: "Choose a priest to view their scheduled appointments, book on behalf of members, or handle emergency cancellations.",
      selectPriestToManage: "Select Father to View Bookings",
      viewPriestBookingsBtn: "View Bookings & Manage",
      backToAssignedPriests: "← Back to Assigned Priests",
      allBookingsTitle: "Confession Appointments for",
      bookOnBehalf: "Book on Behalf of Member",
      bookOnBehalfDesc: "Select a church member and reserve a slot directly for this priest.",
      selectUserToBook: "Select Congregation Member",
      filterByPriest: "Filter by Priest",
      filterByDate: "Filter by Date",
      filterByStatus: "Filter by Status",
      cancelOnBehalfTitle: "Cancel Appointment (Secretary Override)",
      cancelReason: "Reason for Cancellation",
      emergencyOverrideNote: "As Secretary, you can cancel any booking even within the 2-hour cutoff period.",
      totalBookings: "Total Bookings",
      upcomingConfirmed: "Upcoming Confirmed",
      cancelledTotal: "Total Cancelled",
      noAssignedPriests: "No priests currently assigned to your secretary account.",
    },
    notifications: {
      title: "Notification Center & Email Dispatch Log",
      empty: "No notifications logged yet.",
      markAllRead: "Mark all as read",
      emailDispatched: "Email Dispatched",
      bookingConfirmedTitle: "Appointment Confirmed",
      bookingCancelledTitle: "Appointment Cancelled",
      scheduleChangedTitle: "Schedule Updated — Rebook Required",
      priestUnavailableTitle: "Priest Unavailable — Rebook Required",
    },
    cancellationReasons: {
      user_cancelled: "Cancelled by member",
      secretary_cancelled: "Cancelled by Church Secretary",
      priest_schedule_change: "Cancelled due to Father's schedule reconfiguration",
      priest_unavailable: "Cancelled due to Father's emergency/travel unavailability",
      completed: "Confession completed",
      no_show: "Member did not attend (No-Show)",
    },
  },
  ar: {
    appName: "نظام مواعيد سر الاعتراف",
    appSubtitle: "منظومة حجز ومتابعة مواعيد الاعتراف بالكنيسة",
    churchName: "كنيسة الشهيد العظيم مارجرجس والأنبا أنطونيوس",
    roles: {
      admin: "مدير النظام (أدمن)",
      priest: "أبونا (الكاهن)",
      secretary: "سكرتارية الكنيسة",
      general: "شعب الكنيسة (مستخدم)",
    },
    nav: {
      home: "الرئيسية",
      priests: "الآباء الكهنة",
      myAppointments: "موعدي القادم",
      priestSchedule: "جدولي ومتوسط الوقت",
      priestOverrides: "الاستثناءات والاعتذارات",
      priestAppointments: "مواعيد اعترافات أبونا",
      priestProfile: "الملف الشخصي",
      secretaryDashboard: "إدارة السكرتارية",
      adminDashboard: "لوحة تحكم المدير",
      notifications: "الإشعارات والرسائل",
      login: "تسجيل الدخول",
      logout: "تسجيل الخروج",
      switchRole: "تبديل الصلاحية",
      demoRoleSwitcher: "المبدل التفاعلي للأدوار",
    },
    auth: {
      signInTitle: "تسجيل الدخول إلى حسابك",
      signInSubtitle: "أدخل بريدك الإلكتروني وكلمة المرور للدخول إلى بوابة حجز ومتابعة سر الاعتراف.",
      signUpTitle: "إنشاء حساب جديد لشعب الكنيسة",
      signUpSubtitle: "سجل بياناتك الشخصية لحجز ومتابعة مواعيد الاعتراف مع الآباء الكهنة بكل سهولة.",
      emailLabel: "البريد الإلكتروني",
      passwordLabel: "كلمة المرور",
      confirmPasswordLabel: "تأكيد كلمة المرور",
      fullNameLabel: "الاسم بالكامل (ثلاثي أو رباعي)",
      phoneLabel: "رقم الهاتف المحمول",
      signInButton: "تسجيل الدخول",
      signUpButton: "إنشاء الحساب",
      alreadyHaveAccount: "لديك حساب بالفعل؟ تسجيل الدخول",
      dontHaveAccount: "ليس لديك حساب؟ إنشاء حساب جديد",
      passwordsDoNotMatch: "كلمتا المرور غير متطابقتين، يرجى التأكد وإعادة المحاولة.",
      signUpSuccess: "تم إنشاء الحساب بنجاح! أهلاً بك في منظومة سر الاعتراف المقدس.",
      forgotPassword: "نسيت كلمة المرور؟",
      resetPasswordPrompt: "أدخل بريدك الإلكتروني المسجل لإرسال رابط إعادة تعيين كلمة المرور:",
      invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التحقق وإعادة المحاولة.",
      nameRequired: "الاسم بالكامل مطلوب.",
      phoneRequired: "رقم الهاتف المحمول مطلوب.",
      passwordMinLength: "يجب ألا تقل كلمة المرور عن 6 أحرف.",
      welcomeBack: "مرحباً بك مجدداً",
      registerMemberNotice: "يتم تسجيل الحسابات الجديدة تلقائياً كـ (شعب الكنيسة). ترقية الحسابات لكاهن أو سكرتارية تتم بواسطة مدير النظام.",
      signOut: "تسجيل الخروج",
      loggedInAs: "مسجل الدخول باسم",
      switchAccount: "تبديل الحساب",
    },
    adminFlow: {
      title: "مركز إدارة النظام والمستخدمين (سوبر أدمن)",
      subtitle: "إنشاء المستخدمين، تعيين الصلاحيات والأدوار، وإضافة الصور، وربط السكرتارية بالآباء الكهنة.",
      totalUsers: "إجمالي المستخدمين",
      totalPriests: "الآباء الكهنة",
      totalSecretaries: "السكرتارية",
      totalMembers: "شعب الكنيسة",
      createUserBtn: "إنشاء مستخدم جديد",
      createUserTitle: "إضافة مستخدم جديد للنظام",
      editUserTitle: "تعديل بيانات المستخدم والصلاحية",
      editRoleBtn: "تعديل الصلاحية والبيانات",
      userName: "الاسم الكامل",
      userEmail: "البريد الإلكتروني",
      userPhone: "رقم الهاتف",
      userRole: "الصلاحية / الدور",
      titleEn: "المسمى بالإنجليزية",
      titleAr: "المسمى بالعربية",
      photoLabel: "صورة الحساب (الأفاتار)",
      uploadPhoto: "رفع ملف صورة",
      orEnterImageUrl: "أو إدخال رابط الصورة (URL)",
      presetPhotos: "أو اختر صورة جاهزة من المكتبة",
      assignPriestsLabel: "الآباء الكهنة المسندين (للسكرتارية)",
      assignPriestsHelper: "حدد الآباء الكهنة المصرح لهذا السكرتير بإدارة مواعيدهم.",
      priestDurationLabel: "متوسط مدة الاعتراف الأولية (بالدقائق)",
      priestBioLabel: "نبذة رعوية عن أبونا",
      allUsersTable: "سجل حسابات ومستخدمي النظام",
      searchUsers: "بحث بالاسم أو البريد أو الصلاحية...",
      filterRole: "تصفية حسب الصلاحية",
      deleteUserConfirm: "هل أنت متأكد من حذف هذا الحساب من النظام؟",
      userCreatedSuccess: "تم إنشاء المستخدم بنجاح!",
      userUpdatedSuccess: "تم تحديث بيانات المستخدم بنجاح!",
      userDeletedSuccess: "تم حذف المستخدم من النظام.",
    },
    common: {
      loading: "جاري التحميل...",
      save: "حفظ التعديلات",
      saving: "جاري الحفظ...",
      cancel: "إلغاء",
      confirm: "تأكيد",
      delete: "حذف",
      edit: "تعديل",
      add: "إضافة جديد",
      close: "إغلاق",
      back: "رجوع",
      actions: "الإجراءات",
      date: "التاريخ",
      time: "الوقت",
      status: "الحالة",
      duration: "المدة",
      minutes: "دقيقة",
      priest: "أبونا",
      user: "المعترف (المستخدم)",
      notes: "ملاحظات (اختياري)",
      none: "لا يوجد",
      all: "الكل",
      search: "بحث...",
      filter: "تصفية",
      refresh: "تحديث",
      success: "تمت العملية بنجاح",
      error: "خطأ",
      warning: "تنبيه هام",
      notice: "ملاحظة",
    },
    status: {
      available: "متاح للحجز",
      booked: "محجوز",
      unavailable: "غير متاح",
      confirmed: "مؤكد",
      cancelled: "ملغي",
      completed: "تم الاعتراف",
      no_show: "لم يحضر",
    },
    days: {
      0: "الأحد",
      1: "الإثنين",
      2: "الثلاثاء",
      3: "الأربعاء",
      4: "الخميس",
      5: "الجمعة",
      6: "السبت",
    },
    userFlow: {
      selectPriest: "الآباء الكهنة المتاحون للاعتراف",
      selectPriestDesc: "اختر قدس أبونا لفتح صفحة جدول المواعيد الخاصة به وحجز موعدك.",
      selectSlot: "اختر موعداً متاحاً",
      selectSlotDesc: "اختر اليوم والموعد المناسب. يتم تقسيم المواعيد تلقائياً حسب متوسط مدة الاعتراف المحددة من أبونا.",
      bookWithPriest: "حجز موعد اعتراف",
      backToPriestsList: "← العودة لقائمة الآباء",
      activeBookingWarning: "لديك بالفعل موعد اعتراف مؤكد قادم.",
      activeBookingDetails: "القاعدة: يُسمح بحجز موعد مؤكد واحد فقط في نفس الوقت على مستوى جميع الآباء الكهنة. لاختيار موعد آخر، يجب إتمام الموعد الحالي أو إلغاؤه.",
      mustCancelFirst: "يجب إلغاء موعدك الحالي أولاً لتتمكن من حجز موعد جديد.",
      bookSlotTitle: "تأكيد حجز موعد الاعتراف",
      confirmBookingPrompt: "هل أنت متأكد من رغبتك في حجز هذا الموعد لسر الاعتراف؟",
      bookingSuccess: "تم تأكيد الحجز بنجاح!",
      bookingSuccessDesc: "تم إرسال بريد إلكتروني بتفاصيل موعدك.",
      noSlotsAvailable: "لا توجد مواعيد متاحة في هذا اليوم. يرجى اختيار تاريخ آخر.",
      twoHourCutoffWarning: "يُقفل الإلغاء الذاتي قبل ساعتين من موعد الاعتراف.",
      contactSecretaryToCancel: "لا يمكن إلغاء الحجز ذاتياً قبل أقل من ساعتين من الموعد. يرجى التواصل مع سكرتارية الكنيسة للإلغاء الطارئ.",
      secretaryPhone: "01234567890",
      secretaryEmail: "secretary@church.org",
      cancelBookingTitle: "إلغاء موعد الاعتراف",
      cancelBookingConfirm: "هل أنت متأكد من رغبتك في إلغاء موعد الاعتراف؟ سيصبح الموعد متاحاً لباقي الشعب.",
      cancelSuccess: "تم إلغاء الموعد بنجاح.",
      upcomingAppointment: "موعد الاعتراف المؤكد الخاص بك",
      pastAppointments: "المواعيد السابقة والملغاة",
      noUpcomingAppointments: "ليس لديك أي مواعيد اعتراف قادمة حالياً.",
      rollingWindowNotice: "يتم عرض المواعيد المتاحة لأسبوعين قادمين بشكل دوري متجدد.",
    },
    priestFlow: {
      manageSchedule: "إعداد جدول التواجد ومتوسط مدة الاعتراف",
      manageScheduleDesc: "حدد متوسط مدة الاعتراف بالدقائق ومواعيد تواجدك الأسبوعية الثابتة. يقوم النظام بتقسيم الفترات تلقائياً لمواعيد جاهزة للحجز.",
      avgDurationLabel: "متوسط مدة الاعتراف (بالدقائق)",
      avgDurationHelper: "يقوم النظام بتقسيم فترات التواجد تلقائياً بناءً على هذا الوقت (مثلاً 15، 20، 30 دقيقة).",
      weeklyRecurringSchedule: "جدول التواجد الأسبوعي المتكرر",
      addTimeWindow: "إضافة فترة تواجد جديدة",
      dayOfWeek: "يوم الأسبوع",
      startTime: "وقت البدء",
      endTime: "وقت الانتهاء",
      saveScheduleBtn: "حفظ الجدول وإعادة توليد المواعيد",
      regenerateWarningTitle: "تنبيه: إعادة توليد المواعيد تلقائياً",
      regenerateWarningDesc: "حفظ التعديلات سيقوم فوراً بإعادة توليد جميع المواعيد المستقبلية. سيتم تلقائياً إلغاء أي حجوزات مؤكدة مسبقاً وإشعار أصحابها بالبريد الإلكتروني لإعادة الحجز.",
      scheduleOverridesTitle: "الاستثناءات والاعتذارات الطارئة (تواريخ محددة)",
      scheduleOverridesDesc: "يمكنك إضافة مواعيد استثنائية أو تسجيل اعتذار عن يوم كامل (ظروف طارئة، سفر، نهضات، أعياد).",
      addOverrideBtn: "إضافة استثناء لتاريخ معين",
      overrideDate: "تاريخ الاستثناء",
      isUnavailableCheckbox: "تسجيل عدم تواجد أبونا (اعتذار طارئ / إجازة)",
      overrideReason: "السبب / ملاحظة (اختياري)",
      blackoutDateNotice: "تسجيل الاعتذار عن تاريخ معين سيقوم تلقائياً بإلغاء أي حجوزات قائمة في ذلك اليوم وإرسال إيميلات تنبيه لأصحابها.",
      upcomingConfessions: "مواعيد اعترافات أبونا القادمة",
      noAppointmentsScheduled: "لا توجد مواعيد اعترافات مجدولة حتى الآن.",
      totalSlotsToday: "مواعيد اليوم",
      bookedSlots: "المحجوز",
      myProfileTitle: "الملف الشخصي والبيانات الرعوية لأبونا",
      myProfileSubtitle: "تعديل الاسم واللقب الرعوي، وبيانات الاتصال، واسم الكنيسة، والنبذة الرعوية، والصورة الشخصية.",
      churchNameEn: "اسم الكنيسة (بالإنجليزية)",
      churchNameAr: "اسم الكنيسة (بالعربية)",
      bioEn: "النبذة الرعوية والإرشادية (بالإنجليزية)",
      bioAr: "النبذة الرعوية والإرشادية (بالعربية)",
      profileUpdatedSuccess: "تم حفظ وتحديث الملف الشخصي بنجاح! التعديلات ظاهرة الآن في كافة صفحات النظام.",
      saveProfileBtn: "حفظ تعديلات الملف الشخصي",
      smartUpdateTitle: "تحليل تأثير تعديل الجدول والتأكيد الذكي",
      smartUpdateDesc: "قام النظام بمطابقة حجوزات الاعتراف القائمة مع الفترات الجديدة المحددة من قدسك.",
      preservedBookingsCount: "حجوزات مؤكدة تم الإبقاء عليها",
      cancelledBookingsCount: "حجوزات سيتم إلغاؤها",
      noBookingsAffectedNotice: "رائع! لن يتأثر أي موعد من المواعيد المحجوزة الحالية. تظل جميع الحجوزات القائمة مؤكدة كما هي.",
      durationChangeWarning: "تنبيه: تعديل متوسط مدة الاعتراف يغير حدود أوقات المواعيد في كافة الأيام ويلغي الحجوزات المستقبلية.",
      newSlotsEstimateNotice: "سيتم توليد مواعيد جديدة إضافية وإتاحتها فوراً للشعب على مدار الأسبوعين القادمين.",
      confirmScheduleUpdateBtn: "تأكيد وتطبيق الجدول",
      markCompletedBtn: "تسجيل إتمام الاعتراف",
      markNoShowBtn: "تسجيل عدم الحضور",
      markCompletedSuccess: "تم تسجيل إتمام الاعتراف بنجاح وإتاحة الحجز الجديد للمعترف.",
      markNoShowSuccess: "تم تسجيل عدم الحضور وأرشفة الموعد.",
      totalCompleted: "مكتمل",
      totalNoShow: "لم يحضر",
    },
    secretaryFlow: {
      overviewTitle: "مركز عمليات سكرتارية الكنيسة",
      overviewSubtitle: "اختر أحد الآباء الكهنة المسندين إليك أدناه لعرض وإدارة مواعيد اعترافاته.",
      myAssignedPriestsTitle: "الآباء الكهنة المسندون إليك",
      myAssignedPriestsDesc: "اختر قدس أبونا لمتابعة الحجوزات، أو الحجز نيابة عن الشعب، أو إجراء الإلغاء الطارئ.",
      selectPriestToManage: "اختر قدس أبونا لعرض المواعيد",
      viewPriestBookingsBtn: "عرض المواعيد والإدارة",
      backToAssignedPriests: "← العودة لقائمة الآباء المسندين",
      allBookingsTitle: "مواعيد اعترافات قدس",
      bookOnBehalf: "حجز موعد نيابة عن مخدوم",
      bookOnBehalfDesc: "اختر أحد أفراد الشعب لحجز موعد له مباشرة مع هذا الأب.",
      selectUserToBook: "اختر المعترف / عضو الكنيسة",
      filterByPriest: "تصفية حسب أبونا",
      filterByDate: "تصفية حسب التاريخ",
      filterByStatus: "تصفية حسب الحالة",
      cancelOnBehalfTitle: "إلغاء موعد (استثناء السكرتارية)",
      cancelReason: "سبب الإلغاء",
      emergencyOverrideNote: "بصفتك سكرتير الكنيسة، يمكنك إلغاء الموعد حتى في حالة مرور مهلة الساعتين.",
      totalBookings: "إجمالي الحجوزات",
      upcomingConfirmed: "حجوزات قادمة مؤكدة",
      cancelledTotal: "إجمالي الملغي",
      noAssignedPriests: "لا توجد آباء كهنة مسندين إلى حسابك حالياً.",
    },
    notifications: {
      title: "مركز الإشعارات وسجل البريد الإلكتروني",
      empty: "لا توجد إشعارات مسجلة حتى الآن.",
      markAllRead: "تحديد الكل كمقروء",
      emailDispatched: "تم إرسال بريد إلكتروني",
      bookingConfirmedTitle: "تأكيد موعد الاعتراف",
      bookingCancelledTitle: "إلغاء موعد الاعتراف",
      scheduleChangedTitle: "تعديل جدول أبونا — يلزم إعادة الحجز",
      priestUnavailableTitle: "اعتذار أبونا عن الموعد — يلزم إعادة الحجز",
    },
    cancellationReasons: {
      user_cancelled: "تم الإلغاء بواسطة المعترف",
      secretary_cancelled: "تم الإلغاء بواسطة سكرتارية الكنيسة",
      priest_schedule_change: "تم الإلغاء لتعديل جدول مواعيد أبونا",
      priest_unavailable: "تم الإلغاء لظرف طارئ / اعتذار أبونا",
      completed: "تم الاعتراف بحمد الله",
      no_show: "لم يحضر المعترف (غياب)",
    },
  },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  dir: 'ltr' | 'rtl';
  formatDate: (dateStr: string | Date, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (timeStr: string) => string;
  getDayName: (dayOfWeek: number) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('confession_app_lang');
    return (saved === 'ar' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('confession_app_lang', lang);
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  const formatDate = (dateStr: string | Date, options?: Intl.DateTimeFormatOptions) => {
    if (!dateStr) return '';
    const date = typeof dateStr === 'string' ? new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00')) : dateStr;
    if (isNaN(date.getTime())) return String(dateStr);
    
    return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    }).format(date);
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    if (hours === undefined || minutes === undefined) return timeStr;
    
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    const periodEn = h >= 12 ? 'PM' : 'AM';
    const periodAr = h >= 12 ? 'م' : 'ص';
    const hour12 = h % 12 || 12;
    const formattedMinutes = m.toString().padStart(2, '0');

    if (language === 'ar') {
      return `${hour12}:${formattedMinutes} ${periodAr}`;
    }
    return `${hour12}:${formattedMinutes} ${periodEn}`;
  };

  const getDayName = (dayOfWeek: number) => {
    const key = dayOfWeek as keyof Translations['days'];
    return translations[language].days[key] || '';
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
        dir,
        formatDate,
        formatTime,
        getDayName,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
