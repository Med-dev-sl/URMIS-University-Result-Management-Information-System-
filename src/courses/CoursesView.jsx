import FeaturePlaceholder from '../shared/components/FeaturePlaceholder'

const coursesItems = [
  'Course Catalogue',
  'Course Assignment (HoD)',
  'Prerequisites',
  'Course Registration',
]

export default function CoursesView() {
  return <FeaturePlaceholder title="Courses" items={coursesItems} />
}
