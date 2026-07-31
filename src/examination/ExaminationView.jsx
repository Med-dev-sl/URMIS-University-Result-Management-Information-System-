import FeaturePlaceholder from '../shared/components/FeaturePlaceholder'

const examinationItems = [
  'Transcripts',
  'Result Slips',
  'Statement of Results',
  'Graduation',
  'Carry Over',
  'Resit',
  'Classification',
  'Academic Standing',
  'Graduation Clearance',
]

export default function ExaminationView() {
  return <FeaturePlaceholder title="Examination Office" items={examinationItems} />
}
