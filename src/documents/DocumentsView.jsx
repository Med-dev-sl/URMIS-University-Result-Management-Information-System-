import FeaturePlaceholder from '../shared/components/FeaturePlaceholder'

const documentsItems = [
  'Templates',
  'PDF Generation',
  'Downloads',
  'Digital Signatures',
  'Document Archive',
]

export default function DocumentsView() {
  return <FeaturePlaceholder title="Documents" items={documentsItems} />
}
