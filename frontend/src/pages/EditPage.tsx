import style from './EditPage.module.scss';
import { CoverEditor } from '@/components/edit/CoverEditor';
import { EditSidebar } from '@/components/edit/sidebar/EditSidebar';
import { usePortfolioStore, useSelectedProject } from '@/store/portfolioStore';
import { ProjectEditor } from '@/components/edit/ProjectEditor';

export function EditPage() {
  const selectedId = usePortfolioStore(state => state.selectedId);
  const selectedProject = useSelectedProject();

  return (
    <div className={style.editPage}>
      <aside className={style.sidebar}>
        <EditSidebar />
      </aside>

      <section className={style.content}>
        {selectedId === 'cover' && <CoverEditor />}
        {selectedProject && <ProjectEditor project={selectedProject} />}
        {selectedId === null && <p className={style.placeholder}>좌측에서 편집할 항목을 선택해주세요</p>}
      </section>
    </div>
  );
}
