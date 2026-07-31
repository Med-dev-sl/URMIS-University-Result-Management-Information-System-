import FeaturePlaceholder from '../shared/components/FeaturePlaceholder'

const approvalItems = [
  'Lecturer Submission',
  'HoD Review',
  'Dean Approval',
  'Exam Officer Verification',
  'Publication',
]

export default function ApprovalView() {
  return <FeaturePlaceholder title="Approval Workflow" items={approvalItems} />
}
