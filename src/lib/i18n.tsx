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
    myProfile: string;
    priestSchedule: string;
    priestOverrides: string;
    priestAppointments: string;
    priestProfile: string;
    secretaryDashboard: string;
    adminDashboard: string;
    adminOverview: string;
    adminUsers: string;
    adminAuditLogs: string;
    adminAnnouncements: string;
    notifications: string;
    login: string;
    logout: string;
    switchRole: string;
    demoRoleSwitcher: string;
  };
  profile: {
    pageTitle: string;
    pageSubtitle: string;
    personalTab: string;
    churchTab: string;
    confessionTab: string;
    securityTab: string;
    lockedFieldBadge: string;
    lockedFieldNotice: string;
    saveChanges: string;
    savingChanges: string;
    changesSaved: string;
    changePasswordTitle: string;
    currentPasswordLabel: string;
    newPasswordLabel: string;
    confirmNewPasswordLabel: string;
    updatePasswordBtn: string;
    passwordUpdatedSuccess: string;
    confessionStatsTitle: string;
    totalCompletedConfessions: string;
    lastConfessionDate: string;
    nextUpcomingConfession: string;
    noUpcomingConfession: string;
    bookNowBtn: string;
    pastConfessionsTitle: string;
    recordsLabel: string;
    noPastConfessions: string;
    ageLabel: string;
    yearsOld: string;
    confessionFatherLockedNotice: string;
    contactChurchAdmin: string;
    
    // Rhythm & Regularity Reminder
    rhythmTitle: string;
    rhythmSubtitle: string;
    rhythmIntervalLabel: string;
    rhythmInterval2Weeks: string;
    rhythmInterval3Weeks: string;
    rhythmIntervalMonthly: string;
    rhythmInterval45Days: string;
    rhythmInterval2Months: string;
    rhythmInterval3Months: string;
    rhythmRemindersToggle: string;
    rhythmStatusOnTrack: string;
    rhythmStatusDueSoon: string;
    rhythmStatusOverdue: string;
    rhythmStatusNoHistory: string;
    rhythmDaysElapsed: string;
    rhythmDaysRemaining: string;
    rhythmOverdueBy: string;
    rhythmHasUpcomingBadge: string;
    rhythmSpiritualVerse: string;
    rhythmOverdueBannerTitle: string;
    rhythmOverdueBannerBody: string;
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
    
    // New Comprehensive Sign Up Fields
    genderLabel: string;
    genderMale: string;
    genderFemale: string;
    dateOfBirthLabel: string;
    nationalIdLabel: string;
    nationalIdValidationErr: string;
    secondaryPhoneLabel: string;
    maritalStatusLabel: string;
    maritalSingle: string;
    maritalMarried: string;
    maritalWidowed: string;
    maritalDivorced: string;
    professionLabel: string;
    professionPlaceholder: string;
    educationLabel: string;
    educationPlaceholder: string;
    addressLabel: string;
    serviceStatusLabel: string;
    generalMemberOption: string;
    servantOption: string;
    servedOption: string;
    servingStageLabel: string;
    servingStagePlaceholder: string;
    servedStageLabel: string;
    servedStagePlaceholder: string;
    otherServicesLabel: string;
    otherServicesPlaceholder: string;
    sectionIdentity: string;
    sectionContact: string;
    sectionChurch: string;
    sectionSecurity: string;
    mandatoryFieldErr: string;
    
    // Confession Father
    confessionFatherLabel: string;
    selectConfessionFather: string;
    confessionFatherNotice: string;
    confessionFatherRequired: string;
    yourConfessionFatherBadge: string;
    changeConfessionFather: string;
    confessionFatherUpdated: string;
  };
  adminFlow: {
    title: string;
    subtitle: string;
    totalUsers: string;
    totalPriests: string;
    totalSecretaries: string;
    totalMembers: string;
    monitoringTitle: string;
    monitoringSubtitle: string;
    totalBookings: string;
    todayBookings: string;
    weekBookings: string;
    attendanceRate: string;
    priestCapacitiesTitle: string;
    priestCapacitiesDesc: string;
    recentActivityTitle: string;
    recentActivityDesc: string;
    quickActions: string;
    addPriestWizard: string;
    addSecretaryOrUser: string;
    openUserDirectory: string;
    auditLogTitle: string;
    auditLogSubtitle: string;
    userDetailsTitle: string;
    confessionHistory: string;
    noConfessionsYet: string;
    assignedFathers: string;
    priestProfileDetails: string;
    weeklyWindowsTitle: string;
    totalConfessionsHeard: string;
    viewDetails: string;
    filterEvents: string;
    allEvents: string;
    bookingEvents: string;
    cancellationEvents: string;
    attendanceEvents: string;
    notificationEvents: string;
    wizardStep1: string;
    wizardStep2: string;
    wizardStep3: string;
    wizardStep4: string;
    addAvailabilityWindow: string;
    noWindowsConfigured: string;
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
    userPassword: string;
    confirmPassword: string;
    generatePassword: string;
    resetPasswordBtn: string;
    resetPasswordTitle: string;
    resetPasswordSubtitle: string;
    newPasswordLabel: string;
    confirmNewPasswordLabel: string;
    passwordResetSuccess: string;
    allUsersTable: string;
    searchUsers: string;
    filterRole: string;
    deleteUserConfirm: string;
    userCreatedSuccess: string;
    userUpdatedSuccess: string;
    userDeletedSuccess: string;
  };
  announcements: {
    title: string;
    subtitle: string;
    createBtn: string;
    editBtn: string;
    titleArLabel: string;
    titleEnLabel: string;
    contentArLabel: string;
    contentEnLabel: string;
    priorityLabel: string;
    audienceLabel: string;
    priorityNormal: string;
    priorityImportant: string;
    priorityEmergency: string;
    audienceAll: string;
    audienceGeneral: string;
    audiencePriest: string;
    audienceSecretary: string;
    activeStatus: string;
    archivedStatus: string;
    startDate: string;
    endDate: string;
    dismiss: string;
    noAnnouncements: string;
    announcementCreated: string;
    announcementUpdated: string;
    announcementDeleted: string;
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
    showAvailableDaysOnly: string;
    yourBookedSlotBadge: string;
    noAvailableDays: string;
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
    showTodayOnly: string;
    viewSpiritualProfile: string;
    confidentialNotesTitle: string;
    confidentialNotesNotice: string;
    confidentialNotesPlaceholder: string;
    daysSinceLastConfession: string;
    noPreviousConfessions: string;
    saveNotesBtn: string;
    notesSavedSuccess: string;
    memberDossierTitle: string;
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
    churchName: "Saint Mark Church Shobra",
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
      myProfile: "My Profile",
      priestSchedule: "Schedule",
      priestOverrides: "Overrides",
      priestAppointments: "Appointments",
      priestProfile: "Profile",
      secretaryDashboard: "Secretary Operations",
      adminDashboard: "Super Admin",
      adminOverview: "System Overview",
      adminUsers: "User Directory",
      adminAuditLogs: "Audit Log",
      adminAnnouncements: "Announcements",
      notifications: "Notifications",
      login: "Sign In",
      logout: "Sign Out",
      switchRole: "Switch Role",
      demoRoleSwitcher: "Interactive Role Switcher",
    },
    profile: {
      pageTitle: "My Profile & Church Identity",
      pageSubtitle: "View, update, and manage your church fellowship records and confession information.",
      personalTab: "Personal Identity",
      churchTab: "Church Fellowship",
      confessionTab: "Confession Journey",
      securityTab: "Account Security",
      lockedFieldBadge: "Official Church Record (Locked)",
      lockedFieldNotice: "This field is locked according to official church records. Contact church administration to update it.",
      saveChanges: "Save Changes",
      savingChanges: "Saving Changes...",
      changesSaved: "Profile changes saved successfully!",
      changePasswordTitle: "Change Account Password",
      currentPasswordLabel: "Current Password",
      newPasswordLabel: "New Password (Min 6 characters)",
      confirmNewPasswordLabel: "Confirm New Password",
      updatePasswordBtn: "Update Password",
      passwordUpdatedSuccess: "Password updated successfully!",
      confessionStatsTitle: "Spiritual Confession Record",
      totalCompletedConfessions: "Completed Confessions",
      lastConfessionDate: "Last Confession Date",
      nextUpcomingConfession: "Upcoming Confession",
      noUpcomingConfession: "No upcoming confession appointment scheduled.",
      bookNowBtn: "Book Confession Now",
      pastConfessionsTitle: "Previous Confession Sessions",
      recordsLabel: "records",
      noPastConfessions: "No previous completed or recorded confession sessions yet.",
      ageLabel: "Age",
      yearsOld: "years old",
      confessionFatherLockedNotice: "Your Confession Father is assigned by church records. To request a change, please contact church administration.",
      contactChurchAdmin: "Contact Church Office",
      
      // Rhythm & Regularity Reminder
      rhythmTitle: "Confession Regularity & Spiritual Rhythm",
      rhythmSubtitle: "Set your personal spiritual interval to maintain regular participation in the Holy Sacrament.",
      rhythmIntervalLabel: "Target Confession Interval",
      rhythmInterval2Weeks: "Every 2 Weeks (14 Days)",
      rhythmInterval3Weeks: "Every 3 Weeks (21 Days)",
      rhythmIntervalMonthly: "Monthly (30 Days - Recommended)",
      rhythmInterval45Days: "Every 45 Days (Church Fasts)",
      rhythmInterval2Months: "Every 2 Months (60 Days)",
      rhythmInterval3Months: "Quarterly (90 Days)",
      rhythmRemindersToggle: "Enable Regular Confession Reminders",
      rhythmStatusOnTrack: "On Track",
      rhythmStatusDueSoon: "Due Soon",
      rhythmStatusOverdue: "Overdue",
      rhythmStatusNoHistory: "Start Confession Journey",
      rhythmDaysElapsed: "{days} days elapsed",
      rhythmDaysRemaining: "{days} days remaining",
      rhythmOverdueBy: "Overdue by {days} days",
      rhythmHasUpcomingBadge: "Upcoming Confession Scheduled ✨",
      rhythmSpiritualVerse: "“Bring me back and I will return, for You are the Lord my God” (Jeremiah 31:18)",
      rhythmOverdueBannerTitle: "Sacred Spiritual Reminder: Sacrament of Confession",
      rhythmOverdueBannerBody: "It has been more than {days} days since your last confession with {priestName}. The Church lovingly reminds you to renew the blessing of repentance and confession.",
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
      
      // New Comprehensive Sign Up Fields
      genderLabel: "Gender",
      genderMale: "Male",
      genderFemale: "Female",
      dateOfBirthLabel: "Date of Birth",
      nationalIdLabel: "National ID Number (14 digits)",
      nationalIdValidationErr: "National ID must be exactly 14 digits.",
      secondaryPhoneLabel: "Secondary Phone Number (Optional)",
      maritalStatusLabel: "Marital Status",
      maritalSingle: "Single",
      maritalMarried: "Married",
      maritalWidowed: "Widowed",
      maritalDivorced: "Divorced",
      professionLabel: "Profession / Occupation",
      professionPlaceholder: "e.g. Engineer, Doctor, Accountant, Student...",
      educationLabel: "Educational Qualification",
      educationPlaceholder: "e.g. Bachelor's Degree, College Student, High School...",
      addressLabel: "Home Address",
      serviceStatusLabel: "Church Role",
      generalMemberOption: "General Congregation (No specific meeting)",
      servantOption: "Church Servant",
      servedOption: "Attending a Meeting / Sunday School",
      servingStageLabel: "What age / stage do you serve?",
      servingStagePlaceholder: "e.g. Primary, Preparatory, Secondary, Youth...",
      servedStageLabel: "What grade / stage are you in?",
      servedStagePlaceholder: "e.g. 1st Secondary, 2nd College, Graduates...",
      otherServicesLabel: "If you participate in other church activities, mention them here (Optional)",
      otherServicesPlaceholder: "Leave empty if you do not participate in other activities...",
      sectionIdentity: "1. Personal Identity & National ID",
      sectionContact: "2. Contact Info & Home Address",
      sectionChurch: "3. Church Fellowship & Service Role",
      sectionSecurity: "4. Account Security",
      mandatoryFieldErr: "Please fill in all mandatory fields marked with (*).",
      
      // Confession Father
      confessionFatherLabel: "Confession Father",
      selectConfessionFather: "Select your Confession Father",
      confessionFatherNotice: "Note: Confession Father is selected during sign-up. Only your Father's schedule will be available for booking, and this selection can only be modified by Church Administration.",
      confessionFatherRequired: "Please select your Confession Father.",
      yourConfessionFatherBadge: "Your Confession Father",
      changeConfessionFather: "Change Confession Father",
      confessionFatherUpdated: "Confession Father updated successfully.",
    },
    adminFlow: {
      title: "Super Admin Control Center",
      subtitle: "Monitor confession system health, oversee parish operations, and manage user accounts.",
      totalUsers: "Total Users",
      totalPriests: "Priests",
      totalSecretaries: "Secretaries",
      totalMembers: "Congregation Members",
      monitoringTitle: "Parish Confession System Monitoring",
      monitoringSubtitle: "Real-time overview of parish operations, confession capacities, and sacrament metrics.",
      totalBookings: "Total Bookings",
      todayBookings: "Bookings Today",
      weekBookings: "Bookings This Week",
      attendanceRate: "Sacrament Completion Rate",
      priestCapacitiesTitle: "Priests Confession Capacity & Load",
      priestCapacitiesDesc: "Live breakdown of Father's configured schedule, slot duration, and current reservations.",
      recentActivityTitle: "Live Parish Activity Stream",
      recentActivityDesc: "Real-time chronological log of appointments, cancellations, and sacrament completions.",
      quickActions: "Quick Administrative Actions",
      addPriestWizard: "Add New Priest (Full Setup)",
      addSecretaryOrUser: "Add Secretary or Member",
      openUserDirectory: "Open User Directory",
      auditLogTitle: "System Audit Log & Activity Timeline",
      auditLogSubtitle: "Comprehensive chronological record of bookings, cancellations, attendance, and notifications.",
      userDetailsTitle: "User Profile & Sacrament Details",
      confessionHistory: "Confession Sacrament History",
      noConfessionsYet: "No confession appointments recorded for this member yet.",
      assignedFathers: "Assigned Confession Fathers",
      priestProfileDetails: "Pastoral Profile & Schedule Windows",
      weeklyWindowsTitle: "Configured Weekly Availability Windows",
      totalConfessionsHeard: "Confessions Heard",
      viewDetails: "View Profile",
      filterEvents: "Filter Events",
      allEvents: "All Events",
      bookingEvents: "Bookings",
      cancellationEvents: "Cancellations",
      attendanceEvents: "Attendance",
      notificationEvents: "Notifications",
      wizardStep1: "1. Priest Identification",
      wizardStep2: "2. Church & Pastoral Bio",
      wizardStep3: "3. Confession Duration & Slots",
      wizardStep4: "4. Weekly Availability Schedule",
      addAvailabilityWindow: "Add Availability Window",
      noWindowsConfigured: "No weekly availability windows added yet.",
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
      userPassword: "Initial Login Password",
      confirmPassword: "Confirm Password",
      generatePassword: "Generate Password",
      resetPasswordBtn: "Reset Password",
      resetPasswordTitle: "Reset User Password",
      resetPasswordSubtitle: "Set a new direct login password for this account.",
      newPasswordLabel: "New Password",
      confirmNewPasswordLabel: "Confirm New Password",
      passwordResetSuccess: "Password reset successfully! The user can now log in with the new password.",
      allUsersTable: "All System Accounts",
      searchUsers: "Search users by name, email, or role...",
      filterRole: "Filter by Role",
      deleteUserConfirm: "Are you sure you want to remove this user from the system?",
      userCreatedSuccess: "User created successfully!",
      userUpdatedSuccess: "User updated successfully!",
      userDeletedSuccess: "User deleted successfully.",
    },
    announcements: {
      title: "Parish Broadcasts & Announcements",
      subtitle: "Publish top banners, liturgical alerts, and season schedule notices across the congregation.",
      createBtn: "New Announcement",
      editBtn: "Edit Announcement",
      titleArLabel: "Arabic Title",
      titleEnLabel: "English Title",
      contentArLabel: "Arabic Announcement Body",
      contentEnLabel: "English Announcement Body",
      priorityLabel: "Priority Level",
      audienceLabel: "Target Audience",
      priorityNormal: "Normal (Info / Reminder)",
      priorityImportant: "Important (Feasts / Fasting / Schedule)",
      priorityEmergency: "Urgent / Emergency (Persistent Alert)",
      audienceAll: "All Parish Congregation",
      audienceGeneral: "Church Members Only",
      audiencePriest: "Priests (Fathers) Only",
      audienceSecretary: "Secretaries Only",
      activeStatus: "Active & Broadcasting",
      archivedStatus: "Inactive / Archived",
      startDate: "Start Date",
      endDate: "Expiration Date (Optional)",
      dismiss: "Dismiss",
      noAnnouncements: "No parish announcements published yet.",
      announcementCreated: "Announcement published successfully!",
      announcementUpdated: "Announcement updated successfully!",
      announcementDeleted: "Announcement removed.",
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
      showAvailableDaysOnly: "Show Available Days only",
      yourBookedSlotBadge: "Your Reserved Slot ✨",
      noAvailableDays: "No days with available confession slots within the next 14 days.",
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
      showTodayOnly: "Show Today's Appointments Only",
      viewSpiritualProfile: "Spiritual Profile & Notes",
      confidentialNotesTitle: "Father's Confidential Pastoral Notes",
      confidentialNotesNotice: "These pastoral notes are strictly confidential and accessible exclusively to Father. Neither the member nor church administration can view them.",
      confidentialNotesPlaceholder: "Write your pastoral guidance, spiritual canon, or follow-up notes for this member here...",
      daysSinceLastConfession: "{days} days since last confession",
      noPreviousConfessions: "This is the member's first recorded confession session.",
      saveNotesBtn: "Save Confidential Notes",
      notesSavedSuccess: "Pastoral notes saved successfully!",
      memberDossierTitle: "Member Spiritual & Personal Dossier",
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
    churchName: "كنيسة الشهيد العظيم مارمرقس بشبرا",
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
      myProfile: "ملفي الشخصي",
      priestSchedule: "الجدول والمدة",
      priestOverrides: "الاعتذارات",
      priestAppointments: "الحجوزات",
      priestProfile: "الملف الشخصي",
      secretaryDashboard: "إدارة السكرتارية",
      adminDashboard: "لوحة تحكم المدير",
      adminOverview: "نظرة عامة ومراقبة النظام",
      adminUsers: "سجل المستخدمين",
      adminAuditLogs: "سجل العمليات والرقابة",
      adminAnnouncements: "الإذاعة والتنبيهات",
      notifications: "الإشعارات والرسائل",
      login: "تسجيل الدخول",
      logout: "تسجيل الخروج",
      switchRole: "تبديل الصلاحية",
      demoRoleSwitcher: "المبدل التفاعلي للأدوار",
    },
    profile: {
      pageTitle: "ملفي الشخصي وبياناتي الكنسية",
      pageSubtitle: "عرض وتحديث بياناتك الشخصية والتواصل وسجل سر الاعتراف المقدس.",
      personalTab: "البيانات الشخصية",
      churchTab: "الارتباط والخدمة",
      confessionTab: "سجل الاعتراف",
      securityTab: "أمان الحساب",
      lockedFieldBadge: "سجل كنسي رسمي (مقفل)",
      lockedFieldNotice: "هذا الحقل مؤمن ومقفل بسجلات الكنيسة الرسمية، ولا يمكن تعديله إلا من خلال إدارة الكنيسة.",
      saveChanges: "حفظ التعديلات",
      savingChanges: "جارٍ حفظ التعديلات...",
      changesSaved: "تم حفظ التعديلات بنجاح!",
      changePasswordTitle: "تغيير كلمة المرور",
      currentPasswordLabel: "كلمة المرور الحالية",
      newPasswordLabel: "كلمة المرور الجديدة (6 أحرف على الأقل)",
      confirmNewPasswordLabel: "تأكيد كلمة المرور الجديدة",
      updatePasswordBtn: "تحديث كلمة المرور",
      passwordUpdatedSuccess: "تم تحديث كلمة المرور بنجاح!",
      confessionStatsTitle: "سجل سر الاعتراف المقدس",
      totalCompletedConfessions: "إجمالي جلسات الاعتراف المكتملة",
      lastConfessionDate: "تاريخ آخر اعتراف",
      nextUpcomingConfession: "موعد الاعتراف القادم",
      noUpcomingConfession: "لا يوجد موعد اعتراف قادم محجوز حالياً.",
      bookNowBtn: "احجز موعد اعتراف الآن",
      pastConfessionsTitle: "سجل جلسات الاعتراف السابقة",
      recordsLabel: "جلسة",
      noPastConfessions: "لا توجد جلسات اعتراف سابقة مسجلة حتى الآن.",
      ageLabel: "العمر",
      yearsOld: "سنة",
      confessionFatherLockedNotice: "أب الاعتراف محدد ومعتمد بسجلات الكنيسة، ولطلب تغيير أب الاعتراف يرجى التواصل مع إدارة الكنيسة.",
      contactChurchAdmin: "تواصل مع أمانة الكنيسة",
      
      // Rhythm & Regularity Reminder
      rhythmTitle: "متابعة دورية سر الاعتراف",
      rhythmSubtitle: "حدد دوريتك الروحية المفضلة للمواظبة والانتظام على سر التوبة والاعتراف المقدس.",
      rhythmIntervalLabel: "الدورية الروحية المستهدفة",
      rhythmInterval2Weeks: "كل أسبوعين (14 يوماً)",
      rhythmInterval3Weeks: "كل 3 أسابيع (21 يوماً)",
      rhythmIntervalMonthly: "شهرياً (30 يوماً - المعتاد)",
      rhythmInterval45Days: "كل 45 يوماً (أصوام الكنيسة)",
      rhythmInterval2Months: "كل شهرين (60 يوماً)",
      rhythmInterval3Months: "كل 3 أشهر (90 يوماً)",
      rhythmRemindersToggle: "تفعيل التذكير الروحي المنتظم",
      rhythmStatusOnTrack: "منتظم روحيّاً",
      rhythmStatusDueSoon: "حان موعد الاعتراف",
      rhythmStatusOverdue: "تجاوزت المدة المعتادة",
      rhythmStatusNoHistory: "ابدأ رحلة الاعتراف",
      rhythmDaysElapsed: "مضى {days} يوماً",
      rhythmDaysRemaining: "متبقي {days} يوماً",
      rhythmOverdueBy: "تجاوزت المدة بـ {days} يوماً",
      rhythmHasUpcomingBadge: "لديك موعد قادم محجوز ✨",
      rhythmSpiritualVerse: "«تُوبَنِي فَأَتُوبَ لأَنَّكَ أَنْتَ الرَّبُّ إِلهِي» (إر 31: 18)",
      rhythmOverdueBannerTitle: "تذكير روحي مبارك: سر التوبة والاعتراف",
      rhythmOverdueBannerBody: "مرّ أكثر من {days} يوماً على آخر جلسة اعتراف مع {priestName}. تذكرك الكنيسة ببركة تجديد سر التوبة والاعتراف المقدس.",
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
      
      // New Comprehensive Sign Up Fields
      genderLabel: "النوع",
      genderMale: "ذكر",
      genderFemale: "أنثى",
      dateOfBirthLabel: "تاريخ الميلاد",
      nationalIdLabel: "الرقم القومي (١٤ رقماً)",
      nationalIdValidationErr: "يجب أن يتكون الرقم القومي من ١٤ رقماً بالضبط.",
      secondaryPhoneLabel: "رقم هاتف آخر (اختياري)",
      maritalStatusLabel: "الحالة الاجتماعية",
      maritalSingle: "أعزب / آنسة",
      maritalMarried: "متزوج / متزوجة",
      maritalWidowed: "أرمل / أرملة",
      maritalDivorced: "مطلق / مطلقة",
      professionLabel: "المهنة / الوظيفة",
      professionPlaceholder: "مثال: مهندس، طبيب، محاسب، طالب، معلم...",
      educationLabel: "المؤهل الدراسي",
      educationPlaceholder: "مثال: بكالوريوس، ليسانس، طالب جامعي، ثانوية عامة...",
      addressLabel: "العنوان بالتفصيل",
      serviceStatusLabel: "الصفة الكنسية",
      generalMemberOption: "شعب الكنيسة العام (غير ملتحق باجتماع)",
      servantOption: "خادم بالكنيسة",
      servedOption: "مخدوم (ملتحق باجتماع / أسرة)",
      servingStageLabel: "في أي سن تخدم؟",
      servingStagePlaceholder: "مثال: خدمة ابتدائي، إعدادي، ثانوي، شباب...",
      servedStageLabel: "في سنة كام؟",
      servedStagePlaceholder: "مثال: أولى ثانوي، ثانية جامعة، خريجين...",
      otherServicesLabel: "إذا كنت في خدمات أخرى اذكرها هنا (اختياري)",
      otherServicesPlaceholder: "اترك الحقل فارغاً إذا كنت لا تشارك في أنشطة أخرى...",
      sectionIdentity: "١. البيانات الشخصية والرقم القومي",
      sectionContact: "٢. بيانات الاتصال ومحل السكن",
      sectionChurch: "٣. الارتباط والخدمة الكنسية",
      sectionSecurity: "٤. أمان وكلمة مرور الحساب",
      mandatoryFieldErr: "يرجى استكمال جميع الحقول الإلزامية المطلوبة (*).",
      
      // Confession Father
      confessionFatherLabel: "أب الاعتراف",
      selectConfessionFather: "اختر أب اعترافك",
      confessionFatherNotice: "تنبيه: يتم تحديد أب الاعتراف أثناء التسجيل، وستظهر لك مواعيد أب اعترافك فقط لحجز سر الاعتراف، ولا يمكن تعديل هذا الاختيار إلا من خلال إدارة الكنيسة.",
      confessionFatherRequired: "يرجى اختيار أب الاعتراف.",
      yourConfessionFatherBadge: "أب اعترافك الخاص",
      changeConfessionFather: "تعديل أب الاعتراف",
      confessionFatherUpdated: "تم تحديث أب الاعتراف بنجاح.",
    },
    adminFlow: {
      title: "مركز إدارة النظام والمستخدمين (سوبر أدمن)",
      subtitle: "متابعة كفاءة وجداول سر الاعتراف، الإشراف على العمليات، وإدارة حسابات الكنيسة.",
      totalUsers: "إجمالي المستخدمين",
      totalPriests: "الآباء الكهنة",
      totalSecretaries: "السكرتارية",
      totalMembers: "شعب الكنيسة",
      monitoringTitle: "لوحة مراقبة وإحصائيات سر الاعتراف",
      monitoringSubtitle: "نظرة عامة فورية على عمليات الرعاية، طاقات الآباء الكهنة، ومؤشرات خدمة سر الاعتراف.",
      totalBookings: "إجمالي الحجوزات",
      todayBookings: "حجوزات اليوم",
      weekBookings: "حجوزات هذا الأسبوع",
      attendanceRate: "نسبة إتمام نوال السر",
      priestCapacitiesTitle: "طاقة وجداول الآباء الكهنة",
      priestCapacitiesDesc: "تفاصيل الجداول الأسبوعية، مدة الجلسة، ونسبة حجز المواعيد المتاحة لكل أب كاهن.",
      recentActivityTitle: "سجل النشاط المباشر بالكنيسة",
      recentActivityDesc: "سجل فوري زمني للحجوزات، الإلغاءات، ونوال سر الاعتراف المقدس.",
      quickActions: "إجراءات إدارية سريعة",
      addPriestWizard: "إضافة كاهن جديد (إعداد شامل)",
      addSecretaryOrUser: "إضافة أمين سر أو فرد من الشعب",
      openUserDirectory: "فتح سجل المستخدمين",
      auditLogTitle: "سجل العمليات والرقابة على النظام",
      auditLogSubtitle: "سجل زمني شامل وتفصيلي لكافة الحجوزات، الإلغاءات، إثبات الحضور، والإشعارات.",
      userDetailsTitle: "تفاصيل الحساب وسجل الاعترافات",
      confessionHistory: "سجل مواعيد وسر الاعتراف",
      noConfessionsYet: "لا توجد مواعيد اعتراف مسجلة لهذا العضو بعد.",
      assignedFathers: "الآباء الكهنة المسندون",
      priestProfileDetails: "بيانات الخدمة وجداول التواجد",
      weeklyWindowsTitle: "فترات التواجد الأسبوعية الثابتة",
      totalConfessionsHeard: "اعترافات مسموعة",
      viewDetails: "عرض الملف الشخصي",
      filterEvents: "تصفية العمليات",
      allEvents: "كافة العمليات",
      bookingEvents: "الحجوزات",
      cancellationEvents: "الإلغاءات",
      attendanceEvents: "إثبات الحضور",
      notificationEvents: "الإشعارات",
      wizardStep1: "١. بيانات الكاهن والحساب",
      wizardStep2: "٢. الكنيسة والخدمة الرعوية",
      wizardStep3: "٣. مدة جلسة الاعتراف",
      wizardStep4: "٤. جدول المواعيد الأسبوعي",
      addAvailabilityWindow: "إضافة فترة تواجد",
      noWindowsConfigured: "لم يتم إضافة فترات تواجد أسبوعية بعد.",
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
      userPassword: "كلمة المرور الأولية للحساب",
      confirmPassword: "تأكيد كلمة المرور",
      generatePassword: "توليد كلمة مرور عشوائية",
      resetPasswordBtn: "تغيير كلمة المرور",
      resetPasswordTitle: "إعادة تعيين كلمة مرور المستخدم",
      resetPasswordSubtitle: "تعيين كلمة مرور جديدة ومباشرة لهذا الحساب لتسجيل الدخول الفوري.",
      newPasswordLabel: "كلمة المرور الجديدة",
      confirmNewPasswordLabel: "تأكيد كلمة المرور الجديدة",
      passwordResetSuccess: "تمت إعادة تعيين كلمة المرور بنجاح! يمكن للمستخدم الآن تسجيل الدخول بكلمة المرور الجديدة.",
      allUsersTable: "سجل حسابات ومستخدمي النظام",
      searchUsers: "بحث بالاسم أو البريد أو الصلاحية...",
      filterRole: "تصفية حسب الصلاحية",
      deleteUserConfirm: "هل أنت متأكد من حذف هذا الحساب من النظام؟",
      userCreatedSuccess: "تم إنشاء المستخدم بنجاح!",
      userUpdatedSuccess: "تم تحديث بيانات المستخدم بنجاح!",
      userDeletedSuccess: "تم حذف المستخدم من النظام.",
    },
    announcements: {
      title: "إذاعة وتنبيهات الكنيسة الرسمية",
      subtitle: "نشر التنبيهات الإذاعية المباشرة، مواعيد المناسبات الكنسية، وتنبيهات الرعاية لكافة شعب وخدام الكنيسة.",
      createBtn: "إنشاء تنبيه جديد",
      editBtn: "تعديل التنبيه",
      titleArLabel: "عنوان التنبيه (بالعربية)",
      titleEnLabel: "عنوان التنبيه (بالإنجليزية)",
      contentArLabel: "نص التنبيه الإذاعي (بالعربية)",
      contentEnLabel: "نص التنبيه الإذاعي (بالإنجليزية)",
      priorityLabel: "درجة الأهمية",
      audienceLabel: "الفئة المستهدفة",
      priorityNormal: "عادي (معلومات / تذكير عام)",
      priorityImportant: "هام (الأعياد / الصيام / تعديل مواعيد)",
      priorityEmergency: "عاجل / طارئ (بانر مباشر دائم)",
      audienceAll: "كافة شعب وخدام الكنيسة",
      audienceGeneral: "شعب الكنيسة فقط",
      audiencePriest: "الآباء الكهنة فقط",
      audienceSecretary: "سكرتارية الكنيسة فقط",
      activeStatus: "نشط ومذاع بالمنظومة",
      archivedStatus: "غير نشط / مؤرشف",
      startDate: "تاريخ البدء",
      endDate: "تاريخ الانتهاء (اختياري)",
      dismiss: "إغلاق التنبيه",
      noAnnouncements: "لا توجد تنبيهات إذاعية منشورة حالياً.",
      announcementCreated: "تم نشر التنبيه الإذاعي بنجاح!",
      announcementUpdated: "تم تحديث التنبيه الإذاعي بنجاح!",
      announcementDeleted: "تم حذف التنبيه الإذاعي.",
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
      showAvailableDaysOnly: "عرض الأيام المتاحة فقط",
      yourBookedSlotBadge: "موعدك المحجوز ✨",
      noAvailableDays: "لا توجد أيام بها مواعيد اعتراف متاحة حالياً ضمن الـ 14 يوماً القادمة.",
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
      showTodayOnly: "عرض مواعيد اليوم فقط",
      viewSpiritualProfile: "الملف الروحي والملاحظات",
      confidentialNotesTitle: "ملاحظات الأب الكاهن السرية والرعوية",
      confidentialNotesNotice: "هذه الملاحظات خاصة وسرية بقدس أبونا فقط، ولا يمكن لأي مستخدم آخر أو إدارة الكنيسة الاطلاع عليها.",
      confidentialNotesPlaceholder: "اكتب إرشاداتك الرعوية وقانون التوبة أو ملاحظات المتابعة الروحية لهذا المعترف هنا...",
      daysSinceLastConfession: "مضى {days} يوماً منذ آخر اعتراف",
      noPreviousConfessions: "هذه هي أول جلسة اعتراف مسجلة للمعترف.",
      saveNotesBtn: "حفظ الملاحظات السرية",
      notesSavedSuccess: "تم حفظ الملاحظات السرية بنجاح!",
      memberDossierTitle: "الملف الروحي والشخصي للمعترف",
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
    try {
      const date = typeof dateStr === 'string' ? new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00')) : dateStr;
      if (isNaN(date.getTime())) return String(dateStr);
      
      return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options,
      }).format(date);
    } catch {
      return String(dateStr);
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    try {
      const [hours, minutes] = String(timeStr).split(':');
      if (hours === undefined || minutes === undefined) return String(timeStr);
      
      const h = parseInt(hours, 10);
      const m = parseInt(minutes, 10);
      if (isNaN(h) || isNaN(m)) return String(timeStr);
      const periodEn = h >= 12 ? 'PM' : 'AM';
      const periodAr = h >= 12 ? 'م' : 'ص';
      const hour12 = h % 12 || 12;
      const formattedMinutes = m.toString().padStart(2, '0');

      if (language === 'ar') {
        return `${hour12}:${formattedMinutes} ${periodAr}`;
      }
      return `${hour12}:${formattedMinutes} ${periodEn}`;
    } catch {
      return String(timeStr);
    }
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
