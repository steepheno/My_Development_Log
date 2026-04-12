import type { Portfolio } from '../types/portfolio.js';
import type { ProgressCallback } from '../types/progress.js';
import { noopProgress } from '../types/progress.js';
import { sweetbook } from './sweetbookClient.js';
import { toCoverTemplateParams, projectsToContentPages } from '../utils/portfolioMapper.js';
import { BOOK_COVER_TEMPLATE_UID } from '../types/sweetbookTemplates.js';
import { classifySdkError } from '../errors/classifySdkError.js';

export async function createBookFromPortfolio(
  portfolio: Portfolio,
  onProgress: ProgressCallback = noopProgress
): Promise<string> {
  /* ===== 1. 책 생성 ===== */
  let bookUid: string;
  try {
    onProgress({ step: 'book_create', status: 'start' });
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
    onProgress({ step: 'book_create', status: 'done', bookUid });
  } catch (error) {
    throw classifySdkError(error, 'books.create');
  }


  /* ===== 2. 표지 생성 ===== */
  try {
    onProgress({ step: 'cover_create', status: 'start' });
    console.log('[bookService] Creating cover...');
    
    const coverParams = toCoverTemplateParams(portfolio.cover);
    await sweetbook.covers.create(bookUid, BOOK_COVER_TEMPLATE_UID, coverParams);
    console.log('[bookService] Cover created');
    onProgress({ step: 'cover_create', status: 'done' });
  } catch (error) {
    throw classifySdkError(error, 'covers.create');
  }


  /* ===== 3. 내지 생성 ===== */
  const contentPages = projectsToContentPages(portfolio.projects);
  console.log(
    `[bookService] Generated ${contentPages.length} content pages from ${portfolio.projects.length} projects`
  );
  onProgress({ step: 'contents_insert', status: 'start', total: contentPages.length });

  for (let i = 0; i < contentPages.length; i++) {
    const page = contentPages[i];
    try {
      console.log(`[bookService] Inserting content ${i + 1}/${contentPages.length} (${page.kind})...`);
      await sweetbook.contents.insert(bookUid, page.templateUid, page.parameters);
      onProgress({
        step: 'contents_insert',
        status: 'progress',
        current: i + 1,
        total: contentPages.length,
      });
    } catch (error) {
      throw classifySdkError(error, `contents.insert[${i + 1}/${contentPages.length}]`);
    }
  }
  console.log('[bookService] All contents inserted');
  onProgress({ step: 'contents_insert', status: 'done' });


  /* ===== 4. 책 최종화 ===== */
  try {
    onProgress({ step: 'finalize', status: 'start' });
    console.log('[bookService] Finalizing book...');
    await sweetbook.books.finalize(bookUid);
    console.log('[bookService] Book finalized');
    onProgress({ step: 'finalize', status: 'done' });
  } catch (error) {
    throw classifySdkError(error, 'books.finalize');
  }

  return bookUid;
}