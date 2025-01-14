import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HeapLoadingBlock from '@/heap/HeapLoadingBlock';
import { useQuip, useRemoteOutline } from '@/state/diary';
import { useChannelPreview, useGang } from '@/state/groups';
import { udToDec } from '@urbit/api';
import bigInt from 'big-integer';
import useGroupJoin from '@/groups/useGroupJoin';
import useNavigateByApp from '@/logic/useNavigateByApp';
import { ChatBlock, ChatStory } from '@/types/chat';
// eslint-disable-next-line import/no-cycle
import ChatContent from '@/chat/ChatContent/ChatContent';
import { useChannelFlag } from '@/logic/channel';
import ReferenceBar from './ReferenceBar';
import ShipName from '../ShipName';
import ReferenceInHeap from './ReferenceInHeap';
import BubbleIcon from '../icons/BubbleIcon';

function NoteCommentReference({
  chFlag,
  nest,
  noteId,
  quipId,
  isScrolling = false,
  contextApp,
  children,
}: {
  chFlag: string;
  nest: string;
  noteId: string;
  quipId: string;
  isScrolling?: boolean;
  contextApp?: string;
  children?: React.ReactNode;
}) {
  const preview = useChannelPreview(nest);
  const isReply = useChannelFlag() === chFlag;
  const groupFlag = preview?.group?.flag || '~zod/test';
  const gang = useGang(groupFlag);
  const { group } = useGroupJoin(groupFlag, gang);
  const quip = useQuip(chFlag, noteId, quipId, isScrolling);
  const navigateByApp = useNavigateByApp();
  const navigate = useNavigate();
  const location = useLocation();
  const outline = useRemoteOutline(chFlag, noteId, isScrolling);

  const handleOpenReferenceClick = () => {
    if (!group) {
      navigate(`/gangs/${groupFlag}?type=note&nest=${nest}&id=${noteId}`, {
        state: { backgroundLocation: location },
      });
      return;
    }

    navigateByApp(`/groups/${groupFlag}/channels/${nest}/note/${noteId}`);
  };

  if (!quip) {
    return <HeapLoadingBlock reference />;
  }

  const normalizedContent: ChatStory = {
    ...quip.memo.content,
    block: quip.memo.content.block.filter(
      (b) => 'image' in b || 'cite' in b
    ) as ChatBlock[],
  };

  if (contextApp === 'heap-row') {
    return (
      <ReferenceInHeap
        contextApp={contextApp}
        image={<BubbleIcon className="h-6 w-6 text-gray-400" />}
        title={
          <ChatContent
            className="text-lg font-semibold line-clamp-1"
            story={normalizedContent}
            isScrolling={false}
          />
        }
        byline={
          <span className="">
            Comment by <ShipName name={quip.memo.author} showAlias /> on{' '}
            {outline.title}
          </span>
        }
      >
        {children}
      </ReferenceInHeap>
    );
  }

  if (contextApp === 'heap-block') {
    return (
      <ReferenceInHeap
        type="text"
        contextApp={contextApp}
        image={<ChatContent story={normalizedContent} isScrolling={false} />}
        title={
          <h2 className="mb-2 text-lg font-semibold">
            Comment on {outline.title}
          </h2>
        }
      >
        {children}
      </ReferenceInHeap>
    );
  }

  return (
    <div className="writ-inline-block not-prose group">
      <div
        onClick={handleOpenReferenceClick}
        className="cursor-pointer p-2 group-hover:bg-gray-50"
      >
        <ChatContent
          className="p-4"
          story={normalizedContent}
          isScrolling={false}
        />
      </div>
      <ReferenceBar
        nest={nest}
        time={bigInt(udToDec(noteId))}
        author={quip.memo.author}
        groupFlag={preview?.group.flag}
        groupTitle={preview?.group.meta.title}
        channelTitle={preview?.meta?.title}
        comment
        reply={isReply}
      />
    </div>
  );
}

export default React.memo(NoteCommentReference);
