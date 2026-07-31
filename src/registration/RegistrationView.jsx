import FeaturePlaceholder from '../shared/components/FeaturePlaceholder'

const registrationItems = [
  'University Creation',
  'University Administrator Creation',
  'Staff Creation',
  'Student Registration',
  'Activation & Recovery',
  'Registration Logs',
]

export default function RegistrationView() {
  return <FeaturePlaceholder title="Registration" items={registrationItems} />
}
