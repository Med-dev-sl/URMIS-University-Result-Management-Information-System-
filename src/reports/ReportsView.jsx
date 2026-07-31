import FeaturePlaceholder from '../shared/components/FeaturePlaceholder'

const reportsItems = [
  'Student Reports',
  'Department Reports',
  'Faculty Reports',
  'Graduation Reports',
  'Transcript Reports',
  'Performance Analytics',
  'Dashboard Statistics',
]

export default function ReportsView() {
  return <FeaturePlaceholder title="Reports" items={reportsItems} />
}
