import Avatar from '@/components/Avatar';
import Divider from '@/components/Divider';
import Bubble16Icon from '@/components/icons/Bubble16Icon';
import Layout from '@/components/Layout/Layout';
import ShipName from '@/components/ShipName';
import { pluralize } from '@/logic/utils';
import { useBrief, useDiaryState, useNote, useQuips } from '@/state/diary';
import { DiaryBrief, DiaryQuip } from '@/types/diary';
import { daToUnix } from '@urbit/api';
import bigInt from 'big-integer';
import { format, isSameDay } from 'date-fns';
import _ from 'lodash';
import f from 'lodash/fp';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import CaretDown16Icon from '@/components/icons/CaretDown16Icon';
import {
  DiarySetting,
  setSetting,
  useDiaryCommentSortMode,
  useDiarySettings,
  useSettingsState,
} from '@/state/settings';
import DiaryComment, { DiaryCommentProps } from './DiaryComment';
import DiaryCommentField from './DiaryCommentField';
import DiaryContent from './DiaryContent/DiaryContent';
import DiaryNoteHeader from './DiaryNoteHeader';

function groupQuips(
  quips: [bigInt.BigInteger, DiaryQuip][],
  brief: DiaryBrief
) {
  const grouped: Record<string, DiaryCommentProps[]> = {};
  let currentTime: string;

  quips.forEach(([t, q], i) => {
    const prev = i > 0 ? quips[i - 1] : undefined;
    const { author } = q.memo;
    const time = t.toString();
    const newAuthor = author !== prev?.[1].memo.author;
    const unreadBrief =
      brief && brief['read-id'] === q.seal.time ? brief : undefined;

    if (newAuthor) {
      currentTime = time;
    }

    if (!(currentTime in grouped)) {
      grouped[currentTime] = [];
    }

    grouped[currentTime].push({
      time: t,
      quip: q,
      newAuthor,
      newDay: false,
      unreadCount: unreadBrief && brief.count,
    });
  });

  return Object.entries(grouped);
}

function setNewDays(quips: [string, DiaryCommentProps[]][]) {
  return quips.map(([time, comments], index) => {
    const prev = index !== 0 ? quips[index - 1] : undefined;
    const prevQuipTime = prev ? bigInt(prev[0]) : undefined;
    const unix = new Date(daToUnix(bigInt(time)));

    const lastQuipDay = prevQuipTime
      ? new Date(daToUnix(prevQuipTime))
      : undefined;

    const newDay = lastQuipDay ? !isSameDay(unix, lastQuipDay) : false;

    const quip = comments.shift();
    const newComments = [{ ...quip, newDay }, ...comments];
    return [time, newComments] as [string, DiaryCommentProps[]];
  });
}

export default function DiaryNote() {
  const { chShip, chName, noteId = '' } = useParams();
  const chFlag = `${chShip}/${chName}`;
  const [, note] = useNote(chFlag, noteId)!;
  const quips = useQuips(chFlag, noteId);
  const quipArray = Array.from(quips).reverse(); // natural reading order
  const brief = useBrief(chFlag);
  const settings = useDiarySettings();
  const sort = useDiaryCommentSortMode(chFlag);
  const groupedQuips = setNewDays(
    groupQuips(quipArray, brief).sort(([a], [b]) => {
      if (sort === 'asc') {
        return a.localeCompare(b);
      }

      return b.localeCompare(a);
    })
  );

  const setSort = useCallback(
    (setting: 'asc' | 'dsc') => {
      const newSettings = setSetting<DiarySetting>(
        settings,
        { commentSortMode: setting },
        chFlag
      );

      useSettingsState
        .getState()
        .putEntry('diary', 'settings', JSON.stringify(newSettings));
    },
    [settings, chFlag]
  );

  const commenters = _.flow(
    f.compact,
    f.uniq,
    f.take(3)
  )([...quips].map(([, v]) => v.memo.author));

  useEffect(() => {
    useDiaryState.getState().initialize(chFlag);
  }, [chFlag]);

  return (
    <Layout
      className="h-full flex-1 bg-white"
      header={<DiaryNoteHeader title={note.essay.title} />}
    >
      <div className="h-full overflow-y-scroll p-6">
        <section className="mx-auto flex  max-w-[600px] flex-col space-y-12 pb-32">
          {note.essay.image && (
            <img
              src={note.essay.image}
              alt=""
              className="h-auto w-full rounded-xl"
            />
          )}
          <header className="space-y-6">
            <h1 className="text-3xl font-semibold">{note.essay.title}</h1>
            <p className="font-semibold text-gray-400">
              {format(note.essay.sent, 'LLLL do, yyyy')}
            </p>
            <a href="#comments" className="flex items-center">
              <div className="flex items-center space-x-2 font-semibold">
                <Avatar ship={note.essay.author} size="xs" />
                <ShipName name={note.essay.author} />
              </div>
              <div className="ml-auto flex items-center">
                <div className="relative flex items-center font-semibold text-gray-600">
                  {commenters.length > 0 ? (
                    <>
                      {commenters.map((ship, index) => (
                        <Avatar
                          key={ship}
                          ship={ship}
                          size="xs"
                          className="relative outline outline-2 outline-white"
                          style={{
                            zIndex: 2 - index,
                            transform: `translate(${index * -50}%)`,
                          }}
                        />
                      ))}
                      <span>
                        {quips.size} {pluralize('comment', quips.size)}
                      </span>
                    </>
                  ) : (
                    <>
                      <Bubble16Icon className="mr-2 h-4 w-4" />
                      <span className="text-gray-400">No comments</span>
                    </>
                  )}
                </div>
              </div>
            </a>
          </header>
          <DiaryContent content={note.essay.content} />
          <footer id="comments">
            <div className="mb-3 flex items-center py-3">
              <Divider className="flex-1">
                <h2 className="font-semibold text-gray-400">
                  {quips.size > 0
                    ? `${quips.size} ${pluralize('comment', quips.size)}`
                    : 'No comments'}
                </h2>
              </Divider>
              <Dropdown.Root>
                <Dropdown.Trigger className="secondary-button">
                  {sort === 'asc' ? 'Oldest' : 'Newest'}
                  <CaretDown16Icon className="ml-2 h-4 w-4 text-gray-600" />
                </Dropdown.Trigger>
                <Dropdown.Content className="dropdown">
                  <Dropdown.Item
                    className="dropdown-item"
                    onSelect={() => setSort('dsc')}
                  >
                    Newest
                  </Dropdown.Item>
                  <Dropdown.Item
                    className="dropdown-item"
                    onSelect={() => setSort('asc')}
                  >
                    Oldest
                  </Dropdown.Item>
                </Dropdown.Content>
              </Dropdown.Root>
            </div>
            <DiaryCommentField flag={chFlag} replyTo={noteId} />
            <ul className="mt-12">
              {groupedQuips.map(([t, group]) =>
                group.map((props) => (
                  <li key={props.time.toString()}>
                    <DiaryComment {...props} />
                  </li>
                ))
              )}
            </ul>
          </footer>
        </section>
      </div>
    </Layout>
  );
}
