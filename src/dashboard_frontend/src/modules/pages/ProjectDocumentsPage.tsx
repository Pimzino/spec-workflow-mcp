import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DocumentEditorModal, Document } from '../editor/DocumentEditorModal';
import { useApi } from '../api/api';

const documentStructure = [
  {
    category: '要件定義',
    categoryKey: 'requirementDefinition',
    documents: [
      { name: 'プロジェクト概要', nameKey: 'projectOverview' },
      { name: '現行フロー', nameKey: 'currentFlow' },
      { name: '業務要件一覧', nameKey: 'businessRequirements' },
      { name: 'システム化フロー', nameKey: 'systematizationFlow' },
      { name: '機能要件一覧', nameKey: 'functionalRequirements' },
      { name: '非機能要件一覧', nameKey: 'nonFunctionalRequirements' },
    ],
  },
  {
    category: '基本設計',
    categoryKey: 'basicDesign',
    documents: [
      { name: 'システム設計', nameKey: 'systemDesign' },
      { name: 'システム概要', nameKey: 'systemOverview' },
      { name: 'テーブル定義', nameKey: 'tableDefinition' },
      { name: 'ER図', nameKey: 'erDiagram' },
      { name: '画面遷移', nameKey: 'screenTransition' },
      { name: '画面一覧', nameKey: 'screenList' },
      { name: '画面UI', nameKey: 'screenUi' },
    ],
  },
  {
    category: '詳細設計',
    categoryKey: 'detailedDesign',
    documents: [
      { name: '共通コンポーネント', nameKey: 'commonComponents' },
      { name: 'バックエンド処理', nameKey: 'backendProcessing' },
      { name: 'API仕様書', nameKey: 'apiSpecification' },
      { name: 'シーケンス図', nameKey: 'sequenceDiagram' },
      { name: 'アーキテクチャ', nameKey: 'architecture' },
    ],
  },
  {
    category: 'テスト',
    categoryKey: 'test',
    documents: [
      { name: '結合テスト', nameKey: 'integrationTest' },
      { name: 'システムテスト', nameKey: 'systemTest' },
    ],
  },
];

function DocumentItem({ doc, categoryKey, onOpenModal, exists }: { doc: { name: string; nameKey: string }; categoryKey: string; onOpenModal: (doc: Document) => void; exists: boolean }) {
  const { t } = useTranslation();
  const { name, nameKey } = doc;

  const handleClick = () => {
    onOpenModal({
      path: `${categoryKey}/${nameKey}.md`,
      name: t(`documents.${nameKey}`, name),
    });
  };

  return (
    <div
      className="flex items-center justify-between p-3 pl-10 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-md"
      onClick={handleClick}
    >
      <div className="flex items-center">
        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <span>{t(`documents.${nameKey}`, name)}</span>
      </div>
      <span className={`px-2 py-1 text-xs rounded-full ${exists ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'}`}>
        {exists ? t('documents.status.created', 'Created') : t('documents.status.notCreated', 'Not Created')}
      </span>
    </div>
  );
}

function DocumentCategory({ category, categoryKey, documents, onOpenModal, existingDocs }: { category: string; categoryKey: string; documents: { name: string; nameKey: string }[]; onOpenModal: (doc: Document) => void; existingDocs: string[] }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t(`documents.categories.${categoryKey}`, category)}
        </h2>
        <svg
          className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {isOpen && (
        <div className="mt-4 space-y-2">
          {documents.map((doc) => (
            <DocumentItem
              key={doc.nameKey}
              doc={doc}
              categoryKey={categoryKey}
              onOpenModal={onOpenModal}
              exists={existingDocs.includes(`${categoryKey}/${doc.nameKey}.md`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ProjectDocumentsPage() {
  const { t } = useTranslation();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const { listCustomDocuments } = useApi();
  const [existingDocs, setExistingDocs] = useState<string[]>([]);

  const fetchExistingDocs = useCallback(async () => {
    try {
      const docs = await listCustomDocuments();
      setExistingDocs(docs.map(d => d.replace(/\\/g, '/')));
    } catch (error) {
      console.error("Failed to fetch custom documents:", error);
    }
  }, [listCustomDocuments]);


  useEffect(() => {
    fetchExistingDocs();
  }, [fetchExistingDocs]);

  const handleOpenModal = (doc: Document) => {
    setSelectedDocument(doc);
  };

  const handleCloseModal = (shouldReload: boolean) => {
    setSelectedDocument(null);
    if (shouldReload) {
      fetchExistingDocs();
    }
  };

  return (
    <div className="grid gap-6">
       <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {t('nav.documents', 'Project Documents')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('documents.subtitle', 'Create and manage project-specific documents from the UI.')}
            </p>
          </div>
        </div>
      </div>
      {documentStructure.map((category) => (
        <DocumentCategory
          key={category.categoryKey}
          category={category.category}
          categoryKey={category.categoryKey}
          documents={category.documents}
          onOpenModal={handleOpenModal}
          existingDocs={existingDocs}
        />
      ))}
      <DocumentEditorModal
        isOpen={!!selectedDocument}
        onClose={handleCloseModal}
        document={selectedDocument}
      />
    </div>
  );
}
