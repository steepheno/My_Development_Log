import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { Toaster } from 'react-hot-toast';

import { EditPage } from '@/pages/bookCreate/EditPage';
import { PreviewPage } from '@/pages/bookCreate/PreviewPage';
import { OrderPage } from '@/pages/orderCreate/OrderPage';
import { IndexPage } from '@/pages/indexPage/IndexPage';
import { CompletePage } from '@/pages/orderCreate/CompletePage';
import { BookSpecsPage } from '@/pages/catalog/BookSpecsPage';
import { TemplatesPage } from '@/pages/catalog/TemplatesPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <IndexPage /> },
      { path: 'edit', element: <EditPage /> },
      { path: 'preview', element: <PreviewPage /> },
      { path: 'order', element: <OrderPage /> },
      { path: 'complete', element: <CompletePage /> },
      { path: 'book-specs', element: <BookSpecsPage /> },
      { path: 'templates', element: <TemplatesPage /> },
    ],
  },
]);

export function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: '14px',
            maxWidth: '400px',
          },
          success: {
            duration: 2500,
          },
          error: {
            duration: 4000,
          },
        }}
      />
    </>
  );
}
