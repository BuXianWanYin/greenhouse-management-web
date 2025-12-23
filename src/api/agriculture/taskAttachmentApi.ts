import request from '@/utils/http'
import { CodeMsgResult } from '@/types/axios'

// 任务日期附件
export class AgricultureTaskAttachmentService {
    // 查询任务某日期的附件列表
    static listByDate(taskId: number | string, attachmentDate: string) {
        return request.get<any>({
            url: '/agriculture/taskAttachment/listByDate',
            params: { taskId, attachmentDate }
        })
    }

    // 查询任务所有附件
    static listByTask(taskId: number | string) {
        return request.get<any>({
            url: '/agriculture/taskAttachment/listByTask/' + taskId,
        })
    }

    // 获取附件详细
    static getAttachment(attachmentId: number | string) {
        return request.get<any>({
            url: '/agriculture/taskAttachment/' + attachmentId,
        })
    }

    // 新增附件
    static addAttachment(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/taskAttachment',
            data: data
        })
    }

    // 删除附件
    static deleteAttachment(attachmentId: number | string) {
        return request.del<CodeMsgResult>({
            url: '/agriculture/taskAttachment/' + attachmentId,
        })
    }
}
