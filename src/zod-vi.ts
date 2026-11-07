import { z, type ZodErrorMap } from 'zod'

/** Thông báo lỗi schema bằng tiếng Việt cho người sửa file YAML. */
export const viErrorMap: ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.path.at(-1) === 'lieu_g' && issue.received === 'string')
        return { message: 'Liều phải là một số (gam). Liều dạng khoảng (vd "12-16") chưa được hỗ trợ' }
      if (issue.received === 'undefined') return { message: 'Thiếu trường bắt buộc' }
      return { message: `Sai kiểu: cần ${issue.expected}, nhận ${issue.received}` }
    case z.ZodIssueCode.unrecognized_keys:
      return { message: `Trường lạ: ${issue.keys.join(', ')}` }
    case z.ZodIssueCode.invalid_enum_value:
      return { message: `Giá trị phải là một trong: ${issue.options.join(', ')}` }
    case z.ZodIssueCode.too_small:
      if (issue.type === 'array') return { message: 'Danh sách không được rỗng' }
      if (issue.type === 'string') return { message: 'Không được để trống' }
      if (issue.type === 'number') return { message: 'Phải là số dương' }
      break
    case z.ZodIssueCode.invalid_string:
      if (issue.validation === 'url') return { message: 'URL không hợp lệ' }
      break
  }
  return { message: ctx.defaultError }
}
