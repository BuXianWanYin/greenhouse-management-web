import { DictDataService } from '@/api/system/dict/dataApi'

export interface DictType {
  label: string
  value: string
  elTagType?: string
  elTagClass?: string
}

/**
 * 字典工具函数
 * @param args 字典类型
 * @returns Promise
 * 使用不需要权限的接口 /system/dict/data/type/{dictType}
 **/
export function useDict(...args: string[]): Promise<Record<string, DictType[]>> {
  const res = ref<Record<string, any>>({})
  const promises = args.map((dictType) => {
    // 使用不需要权限的接口
    return DictDataService.getDataByType(dictType).then((resp: any) => {
      // 后端返回格式: { code: 200, msg: '', data: [...] }
      const data = resp?.data || resp?.rows || (Array.isArray(resp) ? resp : [])
      res.value[dictType] = data.map((p: any) => ({
        label: p.dictLabel,
        value: p.dictValue,
        elTagType: p.listClass,
        elTagClass: p.cssClass
      }))
    })
  })

  return Promise.all(promises).then(() => toRaw(res.value))
}
