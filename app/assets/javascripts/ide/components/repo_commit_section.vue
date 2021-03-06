<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import tooltip from '~/vue_shared/directives/tooltip';
import icon from '~/vue_shared/components/icon.vue';
import modal from '~/vue_shared/components/modal.vue';
import LoadingButton from '~/vue_shared/components/loading_button.vue';
import commitFilesList from './commit_sidebar/list.vue';
import * as consts from '../stores/modules/commit/constants';
import Actions from './commit_sidebar/actions.vue';

export default {
  components: {
    modal,
    icon,
    commitFilesList,
    Actions,
    LoadingButton,
  },
  directives: {
    tooltip,
  },
  props: {
    noChangesStateSvgPath: {
      type: String,
      required: true,
    },
    committedStateSvgPath: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapState([
      'currentProjectId',
      'currentBranchId',
      'rightPanelCollapsed',
      'lastCommitMsg',
      'changedFiles',
    ]),
    ...mapState('commit', [
      'commitMessage',
      'submitCommitLoading',
    ]),
    ...mapGetters('commit', [
      'commitButtonDisabled',
      'discardDraftButtonDisabled',
      'branchName',
    ]),
    statusSvg() {
      return this.lastCommitMsg ? this.committedStateSvgPath : this.noChangesStateSvgPath;
    },
  },
  methods: {
    ...mapActions([
      'setPanelCollapsedStatus',
    ]),
    ...mapActions('commit', [
      'updateCommitMessage',
      'discardDraft',
      'commitChanges',
      'updateCommitAction',
    ]),
    toggleCollapsed() {
      this.setPanelCollapsedStatus({
        side: 'right',
        collapsed: !this.rightPanelCollapsed,
      });
    },
    forceCreateNewBranch() {
      return this.updateCommitAction(consts.COMMIT_TO_NEW_BRANCH)
        .then(() => this.commitChanges());
    },
  },
};
</script>

<template>
  <div
    class="multi-file-commit-panel-section"
    :class="{
      'multi-file-commit-empty-state-container': !changedFiles.length
    }"
  >
    <modal
      id="ide-create-branch-modal"
      :primary-button-label="__('Create new branch')"
      kind="success"
      :title="__('Branch has changed')"
      @submit="forceCreateNewBranch"
    >
      <template slot="body">
        {{ __(`This branch has changed since you started editing.
          Would you like to create a new branch?`) }}
      </template>
    </modal>
    <commit-files-list
      title="Staged"
      :file-list="changedFiles"
      :collapsed="rightPanelCollapsed"
      @toggleCollapsed="toggleCollapsed"
    />
    <template
      v-if="changedFiles.length"
    >
      <form
        class="form-horizontal multi-file-commit-form"
        @submit.prevent.stop="commitChanges"
        v-if="!rightPanelCollapsed"
      >
        <div class="multi-file-commit-fieldset">
          <textarea
            class="form-control multi-file-commit-message"
            name="commit-message"
            :value="commitMessage"
            :placeholder="__('Write a commit message...')"
            @input="updateCommitMessage($event.target.value)"
          >
          </textarea>
        </div>
        <div class="clearfix prepend-top-15">
          <actions />
          <loading-button
            :loading="submitCommitLoading"
            :disabled="commitButtonDisabled"
            container-class="btn btn-success btn-sm pull-left"
            :label="__('Commit')"
            @click="commitChanges"
          />
          <button
            v-if="!discardDraftButtonDisabled"
            type="button"
            class="btn btn-default btn-sm pull-right"
            @click="discardDraft"
          >
            {{ __('Discard draft') }}
          </button>
        </div>
      </form>
    </template>
    <div
      v-else-if="!rightPanelCollapsed"
      class="row js-empty-state"
    >
      <div class="col-xs-10 col-xs-offset-1">
        <div class="svg-content svg-80">
          <img :src="statusSvg" />
        </div>
      </div>
      <div class="col-xs-10 col-xs-offset-1">
        <div
          class="text-content text-center"
          v-if="!lastCommitMsg"
        >
          <h4>
            {{ __('No changes') }}
          </h4>
          <p>
            {{ __('Edit files in the editor and commit changes here') }}
          </p>
        </div>
        <div
          class="text-content text-center"
          v-else
        >
          <h4>
            {{ __('All changes are committed') }}
          </h4>
          <p v-html="lastCommitMsg">
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
