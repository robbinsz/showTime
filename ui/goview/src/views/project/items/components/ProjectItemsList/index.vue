<template>
  <div class="go-items-list">
    <n-spin :show="loading">
      <div v-if="!list.length && !loading" style="margin-top: 100px; text-align: center">
        <n-empty description="暂无大屏项目，点击左侧「新建」快速创建大屏" />
      </div>
      <n-grid
        v-else
        :x-gap="20"
        :y-gap="20"
        cols="2 s:2 m:3 l:4 xl:4 xxl:4"
        responsive="screen"
      >
        <n-grid-item v-for="(item, index) in list" :key="item.id">
          <project-items-card
            :cardData="item"
            @resize="resizeHandle"
            @delete="deleteHandle($event, index)"
            @edit="editHandle"
          ></project-items-card>
        </n-grid-item>
      </n-grid>
    </n-spin>

    <div v-if="total > 0" class="list-pagination">
      <n-pagination
        v-model:page="pageNo"
        v-model:page-size="pageSize"
        :item-count="total"
        :page-sizes="[10, 20, 30, 40]"
        show-size-picker
        @update:page="fetchList"
        @update:page-size="fetchList"
      />
    </div>
  </div>
  <project-items-modal-card
    v-if="modalData"
    :modalShow="modalShow"
    :cardData="modalData"
    @close="closeModal"
    @edit="editHandle"
  ></project-items-modal-card>
</template>

<script setup lang="ts">
import { ProjectItemsCard } from '../ProjectItemsCard/index'
import { ProjectItemsModalCard } from '../ProjectItemsModalCard/index'
import { useModalDataInit } from './hooks/useModal.hook'
import { useDataListInit } from './hooks/useData.hook'

const { list, loading, pageNo, pageSize, total, fetchList, deleteHandle } = useDataListInit()
const { modalData, modalShow, closeModal, resizeHandle, editHandle } = useModalDataInit()
</script>

<style lang="scss" scoped>
$contentHeight: 250px;
@include go('items-list') {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: calc(100vh - #{$--header-height} * 2 - 2px);
  .list-content {
    position: relative;
    height: $contentHeight;
  }
  .list-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}
</style>
