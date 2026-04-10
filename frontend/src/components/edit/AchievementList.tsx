import style from './AchievementList.module.scss';
import { useState, type KeyboardEvent } from 'react';

interface AchievementListProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}

export function AchievementList({
  value,
  onChange,
  placeholder = '입력 후 Enter키로 추가',
}: AchievementListProps) {
  const [draft, setDraft] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();

    const trimmed = draft.trim();
    if (trimmed.length === 0) return;

    // 성과는 내용 중복 허용
    onChange([...value, trimmed]);
    setDraft('');
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className={style.container}>
      <input
        type="text"
        className={style.input}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />

      {value.length > 0 && (
        <ul className={style.list}>
          {value.map((item, index) => (
            // 성과는 중복 허용 (index를 key 사용)
            <li key={index} className={style.listItem}>
              <span className={style.bullet}>·</span>
              <span className={style.text}>{item}</span>
              <button
                type="button"
                className={style.removeButton}
                onClick={() => handleRemove(index)}
                aria-label={`"${item}" 삭제`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}