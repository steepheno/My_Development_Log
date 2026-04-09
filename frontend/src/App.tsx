import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { EditPage } from '@/pages/EditPage';
import { PreviewPage } from '@/pages/PreviewPage';
import { OrderPage } from '@/pages/OrderPage';
import { IndexPage } from '@/pages/IndexPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <IndexPage /> },
      { path: 'edit', element: <EditPage /> },
      { path: 'preview', element: <PreviewPage /> },
      { path: 'order', element: <OrderPage /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
