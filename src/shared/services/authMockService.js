const mockUniversities = [
  {
    id: 'greenfield',
    name: 'Greenfield University',
    emailDomain: 'greenfield.edu',
    country: 'Nigeria',
  },
  {
    id: 'lakeview',
    name: 'Lakeview University',
    emailDomain: 'lakeview.edu',
    country: 'Kenya',
  },
]

const mockProvisionedAccounts = [
  {
    id: 'staff-1001',
    universityId: 'greenfield',
    accountType: 'staff',
    role: 'lecturer',
    identityValue: 'STF-1001',
    token: 'TOKEN-1001',
    status: 'pending_activation',
    profile: {
      name: 'Amina Yusuf',
      university: 'Greenfield University',
      faculty: 'Science & Technology',
      department: 'Computer Science',
      position: 'Lecturer',
      universityEmail: 'amina.yusuf@greenfield.edu',
      staffId: 'STF-1001',
    },
  },
  {
    id: 'student-1001',
    universityId: 'greenfield',
    accountType: 'student',
    role: 'student',
    identityValue: 'STU-1001',
    token: 'TOKEN-1002',
    status: 'pending_activation',
    profile: {
      name: 'Daniel Okafor',
      university: 'Greenfield University',
      faculty: 'Science & Technology',
      department: 'Computer Science',
      programme: 'Computer Science',
      level: '400 Level',
      studentId: 'STU-1001',
      universityEmail: 'daniel.okafor@greenfield.edu',
    },
  },
]

export function getMockUniversities() {
  return mockUniversities
}

export function validateActivation({ universityId, accountType, identityValue, token }) {
  // TODO: Replace with backend API integration for activation validation.
  const account = mockProvisionedAccounts.find((entry) => {
    const identityMatches = entry.identityValue === identityValue
    const tokenMatches = entry.token === token
    const accountTypeMatches = entry.accountType === accountType
    const universityMatches = entry.universityId === universityId
    return identityMatches && tokenMatches && accountTypeMatches && universityMatches
  })

  if (!account) {
    return {
      success: false,
      message: 'The provided university, identity, or token could not be verified.',
    }
  }

  if (account.status !== 'pending_activation') {
    return {
      success: false,
      message: 'This account is already active or cannot be activated.',
    }
  }

  return {
    success: true,
    account,
    session: {
      ...account.profile,
      universityId: account.universityId,
      accountType: account.accountType,
      role: account.role,
      accountStatus: 'pending_activation',
      permissions: getPermissionsForRole(account.role),
      userId: account.id,
    },
  }
}

export function completeActivation({ userId, password }) {
  // TODO: Replace with backend API integration for account activation completion.
  return {
    success: Boolean(userId && password && password.length >= 8),
    message: 'Account activation completed successfully.',
  }
}

export function getPermissionsForRole(role) {
  switch (role) {
    case 'platform_admin':
      return ['manage_universities', 'manage_university_admins']
    case 'university_admin':
      return ['manage_staff', 'manage_students', 'manage_roles']
    case 'dean':
      return ['review_academics', 'approve_staff']
    case 'hod':
      return ['review_departments', 'approve_staff']
    case 'lecturer':
      return ['manage_courses', 'view_results']
    case 'exam_officer':
      return ['manage_exams', 'review_results']
    case 'registrar':
      return ['manage_records', 'issue_certificates']
    case 'finance_officer':
      return ['manage_finance', 'review_payments']
    case 'ict_staff':
      return ['manage_systems', 'manage_access']
    case 'administrative_staff':
      return ['manage_admin_tasks', 'view_reports']
    case 'student':
    default:
      return ['view_results', 'view_profile']
  }
}

export function buildSessionFromIdentity({ universityId, universityEmail, role, accountStatus }) {
  return {
    userId: 'mock-user',
    universityId,
    role,
    permissions: getPermissionsForRole(role),
    universityEmail,
    accountStatus,
  }
}
