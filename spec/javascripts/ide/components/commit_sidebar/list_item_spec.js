import Vue from 'vue';
import listItem from '~/ide/components/commit_sidebar/list_item.vue';
import router from '~/ide/ide_router';
import mountComponent from 'spec/helpers/vue_mount_component_helper';
import { file } from '../../helpers';

describe('Multi-file editor commit sidebar list item', () => {
  let vm;
  let f;

  beforeEach(() => {
    const Component = Vue.extend(listItem);

    f = file('test-file');

    vm = mountComponent(Component, {
      file: f,
    });
  });

  afterEach(() => {
    vm.$destroy();
  });

  it('renders file path', () => {
    expect(
      vm.$el.querySelector('.multi-file-commit-list-path').textContent.trim(),
    ).toBe(f.path);
  });

  it('calls discardFileChanges when clicking discard button', () => {
    spyOn(vm, 'discardFileChanges');

    vm.$el.querySelector('.multi-file-discard-btn').click();

    expect(vm.discardFileChanges).toHaveBeenCalled();
  });

  it('opens a closed file in the editor when clicking the file path', () => {
    spyOn(vm, 'openFileInEditor').and.callThrough();
    spyOn(vm, 'updateViewer');
    spyOn(router, 'push');

    vm.$el.querySelector('.multi-file-commit-list-path').click();

    expect(vm.openFileInEditor).toHaveBeenCalled();
    expect(router.push).toHaveBeenCalled();
  });

  it('calls updateViewer with diff when clicking file', () => {
    spyOn(vm, 'openFileInEditor').and.callThrough();
    spyOn(vm, 'updateViewer');
    spyOn(router, 'push');

    vm.$el.querySelector('.multi-file-commit-list-path').click();

    expect(vm.updateViewer).toHaveBeenCalledWith('diff');
  });

  describe('computed', () => {
    describe('iconName', () => {
      it('returns modified when not a tempFile', () => {
        expect(vm.iconName).toBe('file-modified');
      });

      it('returns addition when not a tempFile', () => {
        f.tempFile = true;

        expect(vm.iconName).toBe('file-addition');
      });
    });

    describe('iconClass', () => {
      it('returns modified when not a tempFile', () => {
        expect(vm.iconClass).toContain('multi-file-modified');
      });

      it('returns addition when not a tempFile', () => {
        f.tempFile = true;

        expect(vm.iconClass).toContain('multi-file-addition');
      });
    });
  });
});
