export default function AcademicTabs({ activeTab, onChangeTab }) {
  const tabs = ['Faculty', 'Department', 'Course', 'Module']

  return (
    <div className="academic-tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          className={`tab-item ${activeTab === tab ? 'active' : ''}`}
          onClick={() => onChangeTab(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
