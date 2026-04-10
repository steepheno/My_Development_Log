import style from './AddProjectButton.module.scss';
import { usePortfolioStore } from '@/store/portfolioStore';
import { createEmptyProject } from '@/utils/createEmptyProject';

export function AddProjectButton() {
  const addProject = usePortfolioStore((state) => state.addProject);

  const handleClick = () => {
    addProject(createEmptyProject());
  };

  return (
    <button
      type="button"
      className={style.button}
      onClick={handleClick}
    >
      <span className={style.plus}>+</span>
      <span className={style.text}>프로젝트 추가</span>
    </button>
  );
}