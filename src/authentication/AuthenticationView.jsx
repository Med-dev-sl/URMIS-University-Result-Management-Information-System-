import FeaturePlaceholder from '../shared/components/FeaturePlaceholder'

const authenticationItems = [
  'Login',
  'Registration',
  'Password Recovery',
  'Session Management',
  'Roles',
  'Permissions',
]

export default function AuthenticationView() {
  return <FeaturePlaceholder title="Authentication" items={authenticationItems} />
}
