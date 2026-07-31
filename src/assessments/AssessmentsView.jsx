import FeaturePlaceholder from '../shared/components/FeaturePlaceholder'

const assessmentsItems = [
  'Assessment Types',
  'Continuous Assessment',
  'Practicals',
  'Projects',
  'Mid Semester',
  'Examination Scores',
]

export default function AssessmentsView() {
  return <FeaturePlaceholder title="Assessments" items={assessmentsItems} />
}
