import style from './ShippingForm.module.scss';
import type { FormErrors } from '@/components/order/validateShipping';
import type { ShippingInfo } from '@/mocks/defaultShipping';


interface ShippingFormProps {
  value: ShippingInfo;
  onChange: (field: keyof ShippingInfo, value: string) => void;
  errors: FormErrors;
  disabled?: boolean;
}

export function ShippingForm({ value, onChange, errors, disabled = false }: ShippingFormProps) {
  const handleFieldChange =
    (field: keyof ShippingInfo) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange(field, e.target.value);
    };

  return (
    <div className={style.formSection}>
      <h2 className={style.sectionTitle}>배송지 정보</h2>

      <div className={style.formGrid}>
        {/* 수령인 이름 */}
        <div className={style.field}>
          <label
            htmlFor="recipientName"
            className={style.label}
          >
            수령인 <span className={style.required}>*</span>
          </label>
          <input
            id="recipientName"
            type="text"
            value={value.recipientName}
            onChange={handleFieldChange('recipientName')}
            disabled={disabled}
            className={`${style.input} ${errors.recipientName ? style.inputError : ''}`}
            maxLength={100}
          />
          {errors.recipientName && <span className={style.errorMessage}>{errors.recipientName}</span>}
        </div>

        {/* 연락처 */}
        <div className={style.field}>
          <label
            htmlFor="recipientPhone"
            className={style.label}
          >
            연락처 <span className={style.required}>*</span>
          </label>
          <input
            id="recipientPhone"
            type="tel"
            value={value.recipientPhone}
            onChange={handleFieldChange('recipientPhone')}
            disabled={disabled}
            className={`${style.input} ${errors.recipientPhone ? style.inputError : ''}`}
            placeholder="010-0000-0000"
            maxLength={20}
          />
          {errors.recipientPhone && <span className={style.errorMessage}>{errors.recipientPhone}</span>}
        </div>

        {/* 우편번호 */}
        <div className={style.field}>
          <label
            htmlFor="postalCode"
            className={style.label}
          >
            우편번호 <span className={style.required}>*</span>
          </label>
          <input
            id="postalCode"
            type="text"
            inputMode="numeric"
            value={value.postalCode}
            onChange={handleFieldChange('postalCode')}
            disabled={disabled}
            className={`${style.input} ${style.inputShort} ${errors.postalCode ? style.inputError : ''}`}
            placeholder="00000"
            maxLength={5}
          />
          {errors.postalCode && <span className={style.errorMessage}>{errors.postalCode}</span>}
        </div>

        {/* 주소 */}
        <div className={style.field}>
          <label
            htmlFor="address1"
            className={style.label}
          >
            주소 <span className={style.required}>*</span>
          </label>
          <input
            id="address1"
            type="text"
            value={value.address1}
            onChange={handleFieldChange('address1')}
            disabled={disabled}
            className={`${style.input} ${errors.address1 ? style.inputError : ''}`}
            maxLength={200}
          />
          {errors.address1 && <span className={style.errorMessage}>{errors.address1}</span>}
        </div>

        {/* 상세주소 */}
        <div className={style.field}>
          <label
            htmlFor="address2"
            className={style.label}
          >
            상세주소
          </label>
          <input
            id="address2"
            type="text"
            value={value.address2}
            onChange={handleFieldChange('address2')}
            disabled={disabled}
            className={style.input}
            maxLength={200}
          />
        </div>

        {/* 배송 메모 */}
        <div className={style.field}>
          <label
            htmlFor="memo"
            className={style.label}
          >
            배송 메모
          </label>
          <textarea
            id="memo"
            value={value.memo}
            onChange={handleFieldChange('memo')}
            disabled={disabled}
            className={style.textarea}
            placeholder="부재 시 경비실에 맡겨주세요"
            maxLength={200}
            rows={2}
          />
        </div>
      </div>
    </div>
  );
}