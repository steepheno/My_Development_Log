import style from './EditSidebar.module.scss';
import { AddProjectButton } from '@/components/edit/AddProjectButton';
import { SidebarItem } from '@/components/edit/sidebar/SidebarItem';
import { usePortfolioStore } from '@/store/portfolioStore';

export function EditSidebar() {
  const projects = usePortfolioStore(state => state.projects);
  const selectedId = usePortfolioStore(state => state.selectedId);
  const selectItem = usePortfolioStore(state => state.selectItem);
  const removeProject = usePortfolioStore(state => state.removeProject);

  // 프로젝트 삭제 로직
  const handleDeleteProject = (id: string, projectName: string) => {
    const displayName = projectName || '(제목 없음)';
    const confirmed = window.confirm(`'${displayName}' 프로젝트를 삭제할까요?\n삭제하면 되돌릴 수 없어요.`);

    if (confirmed) {
      removeProject(id);
    }
  };

  return (
    <nav className={style.sidebar}>
      <div className={style.section}>
        <p className={style.sectionLabel}>표지</p>
        <SidebarItem
          label="표지"
          isActive={selectedId === 'cover'}
          onClick={() => selectItem('cover')}
        />
      </div>

      <div className={style.section}>
        <p className={style.sectionLabel}>프로젝트</p>
        <ul className={style.list}>
          {projects.map(project => (
            <li key={project.id}>
              <SidebarItem
                label={project.projectName || '(제목 없음)'}
                isActive={selectedId === project.id}
                onClick={() => selectItem(project.id)}
                onDelete={() => handleDeleteProject(project.id, project.projectName)}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* 프로젝트 추가 버튼 */}
      <div>
        <AddProjectButton />
      </div>
    </nav>
  );
}
