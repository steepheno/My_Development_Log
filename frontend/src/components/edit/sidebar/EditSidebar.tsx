import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import style from './EditSidebar.module.scss';
import { AddProjectButton } from '@/components/edit/AddProjectButton';
import { SidebarItem } from '@/components/edit/sidebar/SidebarItem';
import { usePortfolioStore } from '@/store/portfolioStore';
import { notify } from '@/lib/notify';

export function EditSidebar() {
  const projects = usePortfolioStore(state => state.projects);
  const selectedId = usePortfolioStore(state => state.selectedId);
  const selectItem = usePortfolioStore(state => state.selectItem);
  const removeProject = usePortfolioStore(state => state.removeProject);
  const reorderProjects = usePortfolioStore(state => state.reorderProjects);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );

  // 프로젝트 삭제 로직
  const handleDeleteProject = (id: string, projectName: string) => {
    const displayName = projectName || '(제목 없음)';
    const confirmed = window.confirm(
      `'${displayName}' 프로젝트를 삭제할까요?\n삭제하면 되돌릴 수 없어요.`,
    );

    if (confirmed) {
      removeProject(id);
    }
  };

  // 드래그 종료 핸들러
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const fromIndex = projects.findIndex(p => p.id === active.id);
    const toIndex = projects.findIndex(p => p.id === over.id);

    if (fromIndex === -1 || toIndex === -1) return;

    reorderProjects(fromIndex, toIndex);
    notify.projectReordered();
  };

  return (
    <nav className={style.sidebar}>
      <div className={style.section}>
        <p className={style.sectionLabel}>표지</p>
        <SidebarItem
          id="cover"
          label="표지"
          isActive={selectedId === 'cover'}
          onClick={() => selectItem('cover')}
        />
      </div>

      <div className={style.section}>
        <p className={style.sectionLabel}>프로젝트</p>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={projects.map(p => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className={style.list}>
              {projects.map(project => (
                <li key={project.id}>
                  <SidebarItem
                    id={project.id}
                    label={project.projectName || '(제목 없음)'}
                    isActive={selectedId === project.id}
                    onClick={() => selectItem(project.id)}
                    onDelete={() =>
                      handleDeleteProject(project.id, project.projectName)
                    }
                    sortable
                  />
                </li>
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>

      {/* 프로젝트 추가 버튼 */}
      <div>
        <AddProjectButton />
      </div>
    </nav>
  );
}