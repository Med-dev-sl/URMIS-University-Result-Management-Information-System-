import FeaturePlaceholder from '../shared/components/FeaturePlaceholder'

const settingsItems = [
  'Institution Settings',
  'Grading System',
  'Academic Policies',
  'Document Templates',
  'System Preferences',
]

export default function SettingsView() {
  return <FeaturePlaceholder title="Settings" items={settingsItems} />
}
