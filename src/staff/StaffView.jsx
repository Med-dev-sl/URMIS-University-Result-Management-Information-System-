import FeaturePlaceholder from '../shared/components/FeaturePlaceholder'

const staffItems = [
  'University Administrators',
  'Deans',
  'Heads of Department',
  'Lecturers',
  'Exam Officers',
  'Staff Profiles',
]

export default function StaffView() {
  return <FeaturePlaceholder title="Staff" items={staffItems} />
}
