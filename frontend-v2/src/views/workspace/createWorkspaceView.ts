import { defineComponent, h } from 'vue'
import WorkspaceResourceView from './WorkspaceResourceView.vue'

export function createWorkspaceView(pageKey: string) {
  return defineComponent({
    name: `${pageKey}WorkspaceView`,
    setup() {
      return () => h(WorkspaceResourceView, { pageKey })
    },
  })
}
