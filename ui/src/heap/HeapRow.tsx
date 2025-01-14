import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { HeapCurio, isLink } from '@/types/heap';
import cn from 'classnames';
import { isValidUrl, validOembedCheck } from '@/logic/utils';
import { useCalm } from '@/state/settings';
import useEmbedState from '@/state/embed';
import { useRouteGroup, useAmAdmin } from '@/state/groups/groups';
// eslint-disable-next-line import/no-cycle
import HeapContent from '@/heap/HeapContent';
import TwitterIcon from '@/components/icons/TwitterIcon';
import { formatDistanceToNow } from 'date-fns';
import IconButton from '@/components/IconButton';
import ChatSmallIcon from '@/components/icons/ChatSmallIcon';
import ElipsisSmallIcon from '@/components/icons/EllipsisSmallIcon';
import MusicLargeIcon from '@/components/icons/MusicLargeIcon';
import LinkIcon from '@/components/icons/LinkIcon';
import CopyIcon from '@/components/icons/CopyIcon';
import useNest from '@/logic/useNest';
import useHeapContentType from '@/logic/useHeapContentType';
import HeapLoadingBlock from '@/heap/HeapLoadingBlock';
import CheckIcon from '@/components/icons/CheckIcon';
import { inlineToString } from '@/logic/tiptap';
import ConfirmationModal from '@/components/ConfirmationModal';
// eslint-disable-next-line import/no-cycle
import ChatContent from '@/chat/ChatContent/ChatContent';
import { useNavigate } from 'react-router';
import useLongPress from '@/logic/useLongPress';
import Avatar from '@/components/Avatar';
import ShipName from '@/components/ShipName';
import TextIcon from '@/components/icons/Text16Icon';
import Sig16Icon from '@/components/icons/Sig16Icon';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import ContentReference from '@/components/References/ContentReference';
import useCurioActions from './useCurioActions';

interface CurioDisplayProps {
  time: string;
  asRef?: boolean;
  refToken?: string;
}

interface TopBarProps extends CurioDisplayProps {
  isTwitter?: boolean;
  hasIcon?: boolean;
  canEdit: boolean;
  longPress: boolean;
}

function Actions({
  hasIcon = false,
  isTwitter = false,
  refToken = undefined,
  asRef = false,
  longPress = false,
  time,
  canEdit,
}: TopBarProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const nest = useNest();
  const {
    didCopy,
    menuOpen,
    setMenuOpen,
    onDelete,
    deleteStatus,
    onEdit,
    onCopy,
    navigateToCurio,
  } = useCurioActions({ nest, time, refToken });

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={cn('', {
        'justify-between': hasIcon || isTwitter,
        'justify-end': !hasIcon && !isTwitter,
        flex: longPress,
        'group-hover:flex': !longPress,
      })}
    >
      {isTwitter ? <TwitterIcon className="m-2 h-6 w-6" /> : null}
      {hasIcon ? <div className="m-2 h-6 w-6" /> : null}
      <div
        className={cn('flex space-x-2 text-sm text-gray-600', {
          'mt-2': asRef,
          'mr-2': asRef,
        })}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={longPress ? 'block' : 'group-hover:block'}>
          {asRef ? (
            <button
              onClick={navigateToCurio}
              className="small-menu-button border border-gray-100 bg-white px-2 py-1"
            >
              View
            </button>
          ) : (
            <IconButton
              icon={
                didCopy ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <CopyIcon className="h-4 w-4" />
                )
              }
              action={onCopy}
              label="expand"
              className="rounded bg-white"
            />
          )}
        </div>
        {canEdit && (
          <div
            className={longPress ? 'relative' : 'relative group-hover:block'}
          >
            {asRef ? (
              <IconButton
                icon={<ElipsisSmallIcon className="h-4 w-4" />}
                action={() => setMenuOpen(true)}
                label="expand"
                className="rounded border border-gray-100 bg-white"
                small
              />
            ) : (
              <IconButton
                icon={<ElipsisSmallIcon className="h-4 w-4" />}
                label="options"
                className="rounded bg-white"
                action={() => setMenuOpen(!menuOpen)}
              />
            )}
            <div
              className={cn(
                'absolute right-0 flex w-[101px] flex-col items-start rounded bg-white text-sm font-semibold text-gray-800 shadow',
                { hidden: !menuOpen }
              )}
              onMouseLeave={() => setMenuOpen(false)}
            >
              {asRef ? (
                <button
                  className="small-menu-button"
                  onClick={onCopy}
                  disabled={didCopy}
                >
                  {didCopy ? 'Copied' : 'Share'}
                </button>
              ) : null}
              {!asRef && canEdit ? (
                <>
                  <button onClick={onEdit} className="small-menu-button">
                    Edit
                  </button>
                  <button
                    className="small-menu-button text-red"
                    onClick={() => setDeleteOpen(true)}
                  >
                    Delete
                  </button>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
      <ConfirmationModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        onConfirm={onDelete}
        loading={deleteStatus === 'loading'}
        confirmText="Delete"
        title="Delete Gallery Item"
        message="Are you sure you want to delete this gallery item?"
      />
    </div>
  );
}

interface HeapRowProps extends CurioDisplayProps {
  curio: HeapCurio;
  isComment?: boolean;
}

export default function HeapRow({
  curio,
  time,
  asRef = false,
  isComment = false,
  refToken = undefined,
}: HeapRowProps) {
  const [embed, setEmbed] = useState<any>();
  const [longPress, setLongPress] = useState(false);
  const { content } = curio.heart;
  const url =
    content.inline.length > 0 && isLink(content.inline[0])
      ? content.inline[0].link.href
      : '';
  const calm = useCalm();
  const { isImage, isAudio, isText } = useHeapContentType(url);
  const textFallbackTitle = content.inline
    .map((inline) => inlineToString(inline))
    .join(' ')
    .toString();

  const flag = useRouteGroup();
  const isAdmin = useAmAdmin(flag);
  const canEdit = asRef ? false : isAdmin || window.our === curio.heart.author;
  const maybeEmbed = !isImage && !isAudio && !isText && !isComment;

  useEffect(() => {
    const getOembed = async () => {
      if (isValidUrl(url) && maybeEmbed && !calm.disableRemoteContent) {
        try {
          const oembed = await useEmbedState.getState().getEmbed(url);
          setEmbed(oembed);
        } catch (e) {
          setEmbed(null);
          console.log("HeapBlock::getOembed: couldn't get embed", e);
        }
      }
    };
    getOembed();
  }, [url, maybeEmbed, calm]);

  if (
    isValidUrl(url) &&
    embed === undefined &&
    maybeEmbed &&
    !calm.disableRemoteContent
  ) {
    return (
      <div
        className={
          'group flex h-[88px] w-full items-center justify-center space-x-2 rounded-lg bg-gray-50 p-2'
        }
      >
        <LoadingSpinner />
      </div>
    );
  }

  const cnm = (refClass?: string) =>
    asRef
      ? refClass || ''
      : 'w-full bg-white rounded-lg p-2 flex space-x-2 items-center group';
  const { sent } = curio.heart;
  const replyCount = curio.seal.replied.length;
  const prettySent = formatDistanceToNow(sent);

  if (content.block.length > 0 && 'cite' in content.block[0]) {
    return (
      <div className={cnm()}>
        <ContentReference contextApp="heap-row" cite={content.block[0].cite}>
          <div className="mt-3 flex space-x-2 text-base font-semibold text-gray-800">
            <Avatar
              size="xxs"
              className="inline-block"
              ship={curio.heart.author}
            />
            <ShipName
              showAlias={!calm.disableNicknames}
              name={curio.heart.author}
            />
            <span className="hidden text-gray-400 sm:inline">
              {prettySent} ago
            </span>
          </div>
        </ContentReference>
        <div className="shrink-0">
          <Actions
            longPress={false}
            canEdit={canEdit}
            time={curio.heart.sent.toString()}
          />
        </div>
      </div>
    );
  }

  if (isText) {
    return (
      <div className={cnm()}>
        <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded bg-gray-100">
          <TextIcon className="h-6 w-6 text-gray-400" />
        </div>
        <div className="flex grow flex-col">
          <div className="text-lg font-semibold line-clamp-1">
            <HeapContent className={cn('line-clamp-1')} content={content} />
          </div>
          <div className="mt-1 flex space-x-2 text-base font-semibold text-gray-400 line-clamp-1">
            <span>Text</span>
            <span>{replyCount} comments</span>
          </div>
          <div className="mt-3 flex space-x-2 text-base font-semibold text-gray-800">
            <Avatar
              size="xxs"
              className="inline-block"
              ship={curio.heart.author}
            />
            <ShipName
              showAlias={!calm.disableNicknames}
              name={curio.heart.author}
            />
            <span className="hidden text-gray-400 sm:inline">
              {prettySent} ago
            </span>
          </div>
        </div>
        <div className="shrink-0">
          <Actions
            longPress={false}
            canEdit={canEdit}
            time={curio.heart.sent.toString()}
          />
        </div>
      </div>
    );
  }

  if (isImage) {
    return (
      <div className={cnm()}>
        <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded bg-gray-100">
          {!calm?.disableRemoteContent ? (
            <img
              className="h-[72px] w-[72px] rounded object-cover"
              loading="lazy"
              src={url}
              alt={textFallbackTitle}
            />
          ) : (
            <LinkIcon className="h-6 w-6 text-gray-400" />
          )}
        </div>
        <div className="flex grow flex-col">
          <div className="break-all text-lg font-semibold line-clamp-1">
            {textFallbackTitle}
          </div>
          <div className="mt-1 flex space-x-2 text-base font-semibold text-gray-400 line-clamp-1">
            <span>Image</span>
            <a href={url} target="_blank" rel="noreferrer">
              Source
            </a>
            <span>{replyCount} comments</span>
          </div>
          <div className="mt-3 flex space-x-2 text-base font-semibold text-gray-800">
            <Avatar
              size="xxs"
              className="inline-block"
              ship={curio.heart.author}
            />
            <ShipName
              showAlias={!calm.disableNicknames}
              name={curio.heart.author}
            />
            <span className="hidden text-gray-400 sm:inline">
              {prettySent} ago
            </span>
          </div>
        </div>
        <div className="shrink-0">
          <Actions
            longPress={false}
            canEdit={canEdit}
            time={curio.heart.sent.toString()}
          />
        </div>
      </div>
    );
  }

  if (isAudio && !calm?.disableRemoteContent) {
    return (
      <div className={cnm()}>
        <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded bg-gray-100">
          <MusicLargeIcon className="h-6 w-6 text-gray-400" />
        </div>
        <div className="flex grow flex-col">
          <div className="break-all text-lg font-semibold line-clamp-1">
            {textFallbackTitle}
          </div>
          <div className="mt-1 flex space-x-2 text-base font-semibold text-gray-400 line-clamp-1">
            <span>Audio</span>
            <a href={url} target="_blank" rel="noreferrer">
              Source
            </a>
            <span>{replyCount} comments</span>
          </div>
          <div className="mt-3 flex space-x-2 text-base font-semibold text-gray-800">
            <Avatar
              size="xxs"
              className="inline-block"
              ship={curio.heart.author}
            />
            <ShipName
              showAlias={!calm.disableNicknames}
              name={curio.heart.author}
            />
            <span className="hidden text-gray-400 sm:inline">
              {prettySent} ago
            </span>
          </div>
        </div>
        <div className="shrink-0">
          <Actions
            longPress={false}
            canEdit={canEdit}
            time={curio.heart.sent.toString()}
          />
        </div>
      </div>
    );
  }

  const isOembed = validOembedCheck(embed, url);

  if (isOembed && !calm?.disableRemoteContent) {
    const { thumbnail_url: thumbnail, provider_name: provider, title } = embed;

    if (provider === 'Twitter') {
      const twitterHandle = embed.author_url.split('/').pop();
      const twitterProfilePic = `https://unavatar.io/twitter/${twitterHandle}`;

      return (
        <div className={cnm()}>
          <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded bg-gray-100">
            <img
              className="h-[72px] w-[72px] rounded object-cover"
              src={twitterProfilePic}
              alt={twitterHandle}
            />
          </div>
          <div className="flex grow flex-col">
            <div className="break-all text-lg font-semibold line-clamp-1">
              Tweet by @{twitterHandle}
            </div>
            <div className="mt-1 flex space-x-2 text-base font-semibold text-gray-400 line-clamp-1">
              <span>Tweet</span>
              <a href={url} target="_blank" rel="noreferrer">
                Source
              </a>
              <span>{replyCount} comments</span>
            </div>
            <div className="mt-3 flex space-x-2 text-base font-semibold text-gray-800">
              <Avatar
                size="xxs"
                className="inline-block"
                ship={curio.heart.author}
              />
              <ShipName
                showAlias={!calm.disableNicknames}
                name={curio.heart.author}
              />
              <span className="hidden text-gray-400 sm:inline">
                {prettySent} ago
              </span>
            </div>
          </div>
          <div className="shrink-0">
            <Actions
              longPress={false}
              canEdit={canEdit}
              time={curio.heart.sent.toString()}
            />
          </div>
        </div>
      );
    }

    return (
      <div className={cnm()}>
        <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded bg-gray-100">
          {thumbnail && !calm?.disableRemoteContent ? (
            <img
              className="h-[72px] w-[72px] rounded object-cover"
              loading="lazy"
              src={thumbnail}
              alt={textFallbackTitle}
            />
          ) : (
            <LinkIcon className="h-6 w-6 text-gray-400" />
          )}
        </div>
        <div className="flex grow flex-col">
          <div className="break-all text-lg font-semibold line-clamp-1">
            {title && !calm.disableRemoteContent ? title : textFallbackTitle}
          </div>
          <div className="mt-1 flex space-x-2 text-base font-semibold text-gray-400 line-clamp-1">
            <span>Link</span>
            <a href={url} target="_blank" rel="noreferrer">
              Source
            </a>
            <span>{replyCount} comments</span>
          </div>
          <div className="mt-3 flex space-x-2 text-base font-semibold text-gray-800">
            <Avatar
              size="xxs"
              className="inline-block"
              ship={curio.heart.author}
            />
            <ShipName
              showAlias={!calm.disableNicknames}
              name={curio.heart.author}
            />
            <span className="hidden text-gray-400 sm:inline">
              {prettySent} ago
            </span>
          </div>
        </div>
        <div className="shrink-0">
          <Actions
            longPress={false}
            canEdit={canEdit}
            time={curio.heart.sent.toString()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cnm()}>
      <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded bg-gray-100">
        <LinkIcon className="h-6 w-6 text-gray-400" />
      </div>
      <div className="flex grow flex-col">
        <div className="break-all text-lg font-semibold line-clamp-1">
          {textFallbackTitle}
        </div>
        <div className="mt-1 flex space-x-2 text-base font-semibold text-gray-400 line-clamp-1">
          <span>Link</span>
          <a href={url} target="_blank" rel="noreferrer">
            Source
          </a>
          <span>{replyCount} comments</span>
        </div>
        <div className="mt-3 flex space-x-2 text-base font-semibold text-gray-800">
          <Avatar
            size="xxs"
            className="inline-block"
            ship={curio.heart.author}
          />
          <ShipName
            showAlias={!calm.disableNicknames}
            name={curio.heart.author}
          />
          <span className="hidden text-gray-400 sm:inline">
            {prettySent} ago
          </span>
        </div>
      </div>
      <div className="shrink-0">
        <Actions
          longPress={false}
          canEdit={canEdit}
          time={curio.heart.sent.toString()}
        />
      </div>
    </div>
  );
}
