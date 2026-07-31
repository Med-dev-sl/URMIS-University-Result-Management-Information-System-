import FeaturePlaceholder from '../shared/components/FeaturePlaceholder'

const communicationItems = [
  'Notifications',
  'Announcements',
  'Internal Messages',
  'Email',
  'SMS',
]

export default function CommunicationView() {
  return <FeaturePlaceholder title="Communication" items={communicationItems} />
}
