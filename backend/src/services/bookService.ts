import type { Portfolio } from '../types/portfolio.js';
import { sweetbook } from './sweetbookClient.js';
import { toCoverTemplateParams, projectsToContentPages } from '../utils/portfolioMapper.js';
import { BOOK_COVER_TEMPLATE_UID } from '../types/sweetbookTemplates.js';
import { classifySdkError } from '../errors/classifySdkError.js';

/**
 * bookService로 책을 만들고 finalize까지 완료하는 과정
 *
 * 1. books.create
 * 2. covers.create
 * 3. contents.insert × n
 * 4. books.finalize
 */

export async function createBookFromPortfolio(portfolio: Portfolio): Promise<string> {
  /* ===== 1. 책 생성 (books.create) ===== */
  let bookUid: string;
  try {
    console.log('[bookService] Creating book...');
    const book = await sweetbook.books.create({
      bookSpecUid: 'PHOTOBOOK_A5_SC',
      title: `${portfolio.cover.developerName}의 개발일지`,
      creationType: 'TEST',
    });
    bookUid = book.bookUid || book.uid;
    if (!bookUid) {
      throw new Error('SDK response missing bookUid');
    }
    console.log(`[bookService] Book created: ${bookUid}`);
  } catch (error) {
    throw classifySdkError(error, 'books.create');
  }


  /* ===== 2. 표지 생성 (covers.create) ===== */
  try {
    console.log('[bookService] Creating cover...');
    const coverParams = toCoverTemplateParams(portfolio.cover);
    await sweetbook.covers.create(bookUid, BOOK_COVER_TEMPLATE_UID, coverParams);
    console.log('[bookService] Cover created');
  } catch (error) {
    throw classifySdkError(error, 'covers.create');
  }


  /* ===== 3. 내지 생성 (contents.insert × n) ===== */
  const contentPages = projectsToContentPages(portfolio.projects);
  console.log(
    `[bookService] Generated ${contentPages.length} content pages from ${portfolio.projects.length} projects`
  );
  for (let i = 0; i < contentPages.length; i++) {
    const page = contentPages[i];
    try {
      console.log(`[bookService] Inserting content ${i + 1}/${contentPages.length} (${page.kind})...`);
      await sweetbook.contents.insert(bookUid, page.templateUid, page.parameters);
    } catch (error) {
      throw classifySdkError(error, `contents.insert[${i + 1}/${contentPages.length}]`);
    }
  }
  console.log('[bookService] All contents inserted');


  /* ===== 4. 책 최종화 (books.finalize) ===== */
  try {
    console.log('[bookService] Finalizing book...');
    await sweetbook.books.finalize(bookUid);
    console.log('[bookService] Book finalized');
  } catch (error) {
    throw classifySdkError(error, 'books.finalize');
  }

  return bookUid;
}