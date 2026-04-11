import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { EditPage } from '@/pages/EditPage';
import { PreviewPage } from '@/pages/PreviewPage';
import { OrderPage } from '@/pages/OrderPage';
import { IndexPage } from '@/pages/IndexPage';
import { CompletePage } from '@/pages/CompletePage';
import { Toaster } from 'react-hot-toast';

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
