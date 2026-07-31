import FeaturePlaceholder from '../shared/components/FeaturePlaceholder'

const platformItems = [
  'Institution Management',
  'Subscription Management',
  'Platform Analytics',
  'Global Settings',
  'Audit Logs',
  'System Administration',
]

export default function PlatformView() {
  return <FeaturePlaceholder title="Platform" items={platformItems} />
}
