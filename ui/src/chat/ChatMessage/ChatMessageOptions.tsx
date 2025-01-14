import React, { useCallback, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { useCopy, canWriteChannel } from '@/logic/utils';
import { useAmAdmin, useGroup, useRouteGroup, useVessel } from '@/state/groups';
import { useChatPerms, useChatState } from '@/state/chat';
import { ChatWrit } from '@/types/chat';
import IconButton from '@/components/IconButton';
import useEmoji from '@/state/emoji';
import BubbleIcon from '@/components/icons/BubbleIcon';
import FaceIcon from '@/components/icons/FaceIcon';
import HashIcon from '@/components/icons/HashIcon';
import XIcon from '@/components/icons/XIcon';
import { useChatDialog } from '@/chat/useChatStore';
import CopyIcon from '@/components/icons/CopyIcon';
import CheckIcon from '@/components/icons/CheckIcon';
import EmojiPicker from '@/components/EmojiPicker';
import ConfirmationModal from '@/components/ConfirmationModal';
import useRequestState from '@/logic/useRequestState';
import { useIsMobile } from '@/logic/useMedia';
import useGroupPrivacy from '@/logic/useGroupPrivacy';
import { captureGroupsAnalyticsEvent } from '@/logic/analytics';

export default function ChatMessageOptions(props: {
  whom: string;
  writ: ChatWrit;
  hideThreadReply?: boolean;
  hideReply?: boolean;
}) {
  const { whom, writ, hideThreadReply, hideReply } = props;
  const groupFlag = useRouteGroup();
  const isAdmin = useAmAdmin(groupFlag);
  const { didCopy, doCopy } = useCopy(
    `/1/chan/chat/${whom}/msg/${writ.seal.id}`
  );
  const { open: pickerOpen, setOpen: setPickerOpen } = useChatDialog(
    whom,
    writ.seal.id,
    'picker'
  );
  const { open: deleteOpen, setOpen: setDeleteOpen } = useChatDialog(
    whom,
    writ.seal.id,
    'delete'
  );
  const {
    isPending: isDeletePending,
    setPending: setDeletePending,
    setReady,
  } = useRequestState();
  const { chShip, chName } = useParams();
  const [, setSearchParams] = useSearchParams();
  const { load: loadEmoji } = useEmoji();
  const isMobile = useIsMobile();
  const chFlag = `${chShip}/${chName}`;
  const perms = useChatPerms(chFlag);
  const vessel = useVessel(groupFlag, window.our);
  const group = useGroup(groupFlag);
  const { privacy } = useGroupPrivacy(groupFlag);
  const canWrite = canWriteChannel(perms, vessel, group?.bloc);
  const navigate = useNavigate();
  const location = useLocation();

  const onDelete = async () => {
    setDeletePending();
    try {
      await useChatState.getState().delMessage(whom, writ.seal.id);
    } catch (e) {
      console.log('Failed to delete message', e);
    }
    setReady();
  };

  const onCopy = useCallback(() => {
    doCopy();
  }, [doCopy]);

  const reply = useCallback(() => {
    setSearchParams({ chat_reply: writ.seal.id }, { replace: true });
  }, [writ, setSearchParams]);

  const onEmoji = useCallback(
    (emoji: { shortcodes: string }) => {
      useChatState.getState().addFeel(whom, writ.seal.id, emoji.shortcodes);
      captureGroupsAnalyticsEvent({
        name: 'react_item',
        groupFlag,
        chFlag: whom,
        channelType: 'chat',
        privacy,
      });
      setPickerOpen(false);
    },
    [whom, groupFlag, privacy, writ, setPickerOpen]
  );

  const openPicker = useCallback(() => setPickerOpen(true), [setPickerOpen]);

  useEffect(() => {
    if (isMobile) {
      loadEmoji();
    }
  }, [isMobile, loadEmoji]);

  return (
    <div className="absolute right-2 -top-5 z-10 h-full">
      <div
        data-testid="chat-message-options"
        className="sticky top-0 flex space-x-0.5 rounded-lg border border-gray-100 bg-white p-[1px] align-middle"
      >
        {canWrite && !isMobile ? (
          <EmojiPicker
            open={pickerOpen}
            setOpen={setPickerOpen}
            onEmojiSelect={onEmoji}
            withTrigger={false}
          >
            <IconButton
              icon={<FaceIcon className="h-6 w-6 text-gray-400" />}
              label="React"
              showTooltip
              aria-label="React"
              action={openPicker}
            />
          </EmojiPicker>
        ) : null}
        {canWrite && isMobile ? (
          <IconButton
            icon={<FaceIcon className="h-6 w-6 text-gray-400" />}
            label="React"
            aria-label="React"
            showTooltip
            action={() =>
              navigate(`picker/${writ.seal.id}`, {
                state: { backgroundLocation: location },
              })
            }
          />
        ) : null}
        {!hideReply ? (
          <IconButton
            icon={<BubbleIcon className="h-6 w-6 text-gray-400" />}
            label="Reply"
            showTooltip
            action={reply}
          />
        ) : null}
        {!writ.memo.replying &&
        writ.memo.replying?.length !== 0 &&
        !hideThreadReply ? (
          <IconButton
            icon={<HashIcon className="h-6 w-6 text-gray-400" />}
            label="Start Thread"
            showTooltip
            action={() => navigate(`message/${writ.seal.id}`)}
          />
        ) : null}
        {groupFlag ? (
          <IconButton
            icon={
              didCopy ? (
                <CheckIcon className="h-6 w-6 text-gray-400" />
              ) : (
                <CopyIcon className="h-6 w-6 text-gray-400" />
              )
            }
            label="Copy"
            showTooltip
            action={onCopy}
          />
        ) : null}
        {isAdmin || window.our === writ.memo.author ? (
          <IconButton
            icon={<XIcon className="h-6 w-6 text-red" />}
            label="Delete"
            showTooltip
            action={() => setDeleteOpen(true)}
          />
        ) : null}
        <ConfirmationModal
          title="Delete Message"
          message="Are you sure you want to delete this message?"
          onConfirm={onDelete}
          open={deleteOpen}
          setOpen={setDeleteOpen}
          confirmText="Delete"
          loading={isDeletePending}
        />
      </div>
    </div>
  );
}
