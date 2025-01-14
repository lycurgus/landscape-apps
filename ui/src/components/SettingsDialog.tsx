import { useDismissNavigate } from '@/logic/routing';
import {
  Theme,
  useCalm,
  useCalmSettingMutation,
  useLogActivity,
  usePutEntryMutation,
  useTheme,
  useThemeMutation,
} from '@/state/settings';
import { isGroups, isTalk } from '@/logic/utils';
import { useIsMobile } from '@/logic/useMedia';
import Dialog from './Dialog';
import Setting from './Setting';
import SettingDropdown from './SettingDropdown';
import Sheet, { SheetContent } from './Sheet';

export default function SettingsDialog() {
  const logActivity = useLogActivity();
  const {
    disableAvatars,
    disableNicknames,
    disableSpellcheck,
    disableRemoteContent,
    disableWayfinding,
  } = useCalm();
  const theme = useTheme();
  const { mutate, status } = useThemeMutation();
  const dismiss = useDismissNavigate();
  const { mutate: toggleAvatars, status: avatarStatus } =
    useCalmSettingMutation('disableAvatars');
  const { mutate: toggleNicknames, status: nicknameStatus } =
    useCalmSettingMutation('disableNicknames');
  const { mutate: toggleSpellcheck, status: spellcheckStatus } =
    useCalmSettingMutation('disableSpellcheck');
  const { mutate: toggleRemoteContent, status: remoteContentStatus } =
    useCalmSettingMutation('disableRemoteContent');
  const { mutate: toggleWayfinding, status: wayfindingStatus } =
    useCalmSettingMutation('disableWayfinding');
  const { mutate: toggleLogActivity, status: logActivityStatus } =
    usePutEntryMutation({ bucket: window.desk, key: 'logActivity' });
  const onOpenChange = (open: boolean) => {
    if (!open) {
      dismiss();
    }
  };
  const isMobile = useIsMobile();

  function renderContent() {
    return (
      <div className="flex flex-col space-y-8">
        <span className="text-lg font-bold">App Settings</span>
        <div className="inner-section relative space-y-4">
          <div className="mb-6 flex flex-col">
            <h2 className="mb-2 text-lg font-bold">CalmEngine</h2>
            <span className="text-gray-600">
              Tune the behavior of attention-grabbing interfaces in{' '}
              {isTalk ? 'Talk' : 'Groups'}
            </span>
          </div>
          <Setting
            on={disableAvatars}
            toggle={() => toggleAvatars(!disableAvatars)}
            status={avatarStatus}
            name="Disable avatars"
            labelClassName='font-semibold'
          >
            <p className="leading-5 text-gray-600">
              Turn user-set visual avatars off and only display urbit sigils in{' '}
              {isTalk ? 'Talk' : 'Groups'}
            </p>
          </Setting>
          <Setting
            on={disableNicknames}
            toggle={() => toggleNicknames(!disableNicknames)}
            status={nicknameStatus}
            name="Disable nicknames"
            labelClassName='font-semibold'
          >
            <p className="leading-5 text-gray-600">
              Turn user-set nicknames off and only display urbit-style names
              across {isTalk ? 'Talk' : 'Groups'}
            </p>
          </Setting>
          <Setting
            on={disableWayfinding}
            toggle={() => toggleWayfinding(!disableWayfinding)}
            status={wayfindingStatus}
            name="Disable wayfinding"
            labelClassName='font-semibold'
          >
            <p className="leading-5 text-gray-600">
              Turn off the "wayfinding" helper menu in the bottom left of the{' '}
              {isTalk ? 'Talk' : 'Groups'} sidebar
            </p>
          </Setting>
        </div>
        <div className="inner-section relative space-y-4">
          <div className="mb-6 flex flex-col">
            <h2 className="mb-2 text-lg font-bold">Privacy</h2>
            <span className="text-gray-600">
              Limit your urbit’s ability to be read or tracked by clearnet
              services in {isTalk ? 'Talk' : 'Groups'}
            </span>
          </div>
          {isGroups && (
            <Setting
              on={logActivity}
              toggle={() => toggleLogActivity({ val: !logActivity })}
              status={logActivityStatus}
              name="Log Groups Usage"
            labelClassName='font-semibold'
            >
              <p className="leading-5 text-gray-600">
                Enable or disable basic activity tracking in Groups. Tlon uses
                this data to make product decisions and to bring you a better
                Groups experience.
              </p>
            </Setting>
          )}
          <Setting
            on={disableSpellcheck}
            toggle={() => toggleSpellcheck(!disableSpellcheck)}
            status={spellcheckStatus}
            name="Disable spell-check"
            labelClassName='font-semibold'
          >
            <p className="leading-5 text-gray-600">
              Turn spell-check off across all text inputs in{' '}
              {isTalk ? 'Talk' : 'Groups'}. Spell-check reads your keyboard
              input, which may be undesirable.
            </p>
          </Setting>
          <Setting
            on={disableRemoteContent}
            toggle={() => toggleRemoteContent(!disableRemoteContent)}
            status={remoteContentStatus}
            name="Disable remote content"
            labelClassName='font-semibold'
          >
            <p className="leading-5 text-gray-600">
              Turn off automatically-displaying media embeds across{' '}
              {isTalk ? 'Talk' : 'Groups'}. This may result in some software
              appearing to have content missing.
            </p>
          </Setting>
        </div>
        <div className="inner-section relative space-y-2">
          <div className="flex flex-col">
            <h2 className="mb-2 text-lg font-bold">Theme</h2>
          </div>
          <SettingDropdown
            name="Set your theme"
            selected={{
              label: theme.charAt(0).toUpperCase() + theme.slice(1),
              value: theme,
            }}
            onChecked={(value) => {
              mutate(value as Theme);
            }}
            options={[
              { label: 'Auto', value: 'auto' },
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' },
            ]}
            status={status}
          >
            <p className="leading-5 text-gray-600">
              Change the color scheme of the {isTalk ? 'Talk' : 'Groups'}{' '}
            </p>
          </SettingDropdown>
        </div>
      </div>
    );
  }

  return isMobile ? (
    <Sheet open={true} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col overflow-y-auto" showClose={false}>
        {renderContent()}
      </SheetContent>
    </Sheet>
  ) : (
    <Dialog
      defaultOpen
      modal
      onOpenChange={onOpenChange}
      containerClass="flex"
      className="w-[340px] overflow-y-auto md:w-[500px]"
    >
      {renderContent()}
    </Dialog>
  );
}
