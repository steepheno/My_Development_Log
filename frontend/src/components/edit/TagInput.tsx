import style from './TagInput.module.scss';
import { useState, type KeyboardEvent } from 'react';

interface TagInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}

export function TagInput({
  value,
  onChange,
  placeholder = '입력 후 Enter키로 추가',
}: TagInputProps) {
  /**
   * 입력창의 "아직 확정되지 않은" 문자열.
   * 엔터를 치는 순간에만 부모의 배열에 반영되므로, 이 값은 스토어에
   * 저장할 필요 없이 컴포넌트 내부에서 관리한다.
   */
  const [draft, setDraft] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;

    // 폼 안에 들어있을 경우 Enter가 submit으로 이어지지 않도록 처리
    e.preventDefault();

    const trimmed = draft.trim();
    if (trimmed.length === 0) return;

    // 중복 체크 - 이미 있는 태그는 무시하고 입력창만 비움
    if (value.includes(trimmed)) {
      setDraft('');
      return;
    }

    onChange([...value, trimmed]);
    setDraft('');
  };

  const handleRemove = (target: string) => {
    onChange(value.filter((tag) => tag !== target));
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
        <ul className={style.tagList}>
          {value.map((tag) => (
            // tag는 중복 방지 (key로 사용 가능)
            <li key={tag} className={style.tagItem}>
              <span className={style.tagLabel}>{tag}</span>
              <button
                type="button"
                className={style.removeButton}
                onClick={() => handleRemove(tag)}
                aria-label={`${tag} 삭제`}
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