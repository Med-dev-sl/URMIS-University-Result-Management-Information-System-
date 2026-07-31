import AcademicsOverview from './components/AcademicsOverview'
import AcademicTabs from './components/AcademicTabs'
import AcademicPanels from './components/AcademicPanels'

export default function AcademicsView({
  selectedFaculty,
  selectedDepartment,
  selectedCourse,
  facultyOptions,
  departmentOptions,
  courseOptions,
  moduleList,
  activeAcademicTab,
  onChangeTab,
  onAcademicInputChange,
  onFacultyChange,
  onDepartmentChange,
  onCourseChange,
  onCreateFaculty,
  onCreateDepartment,
  onCreateCourse,
  onCreateModule,
  academicForm,
}) {
  return (
    <>
      <AcademicsOverview
        selectedFaculty={selectedFaculty}
        selectedDepartment={selectedDepartment}
        selectedCourse={selectedCourse}
        facultyOptions={facultyOptions}
        departmentOptions={departmentOptions}
        courseOptions={courseOptions}
        onFacultyChange={onFacultyChange}
        onDepartmentChange={onDepartmentChange}
        onCourseChange={onCourseChange}
        moduleList={moduleList}
      />

      <article className="panel full-width-panel">
        <div className="panel-header">
          <h3>Manage curriculum</h3>
        </div>
        <AcademicTabs activeTab={activeAcademicTab} onChangeTab={onChangeTab} />
        <AcademicPanels
          activeTab={activeAcademicTab}
          academicForm={academicForm}
          selectedFaculty={selectedFaculty}
          selectedDepartment={selectedDepartment}
          selectedCourse={selectedCourse}
          facultyOptions={facultyOptions}
          departmentOptions={departmentOptions}
          courseOptions={courseOptions}
          onAcademicInputChange={onAcademicInputChange}
          onFacultyChange={onFacultyChange}
          onDepartmentChange={onDepartmentChange}
          onCourseChange={onCourseChange}
          onCreateFaculty={onCreateFaculty}
          onCreateDepartment={onCreateDepartment}
          onCreateCourse={onCreateCourse}
          onCreateModule={onCreateModule}
        />
      </article>
    </>
  )
}
