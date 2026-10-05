import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  BookOpen,
  Library,
  Plus,
  BarChart3,
  Target,
  NotebookPen,
  Heart,
  List,
  Settings,
  Search,
  Trash2,
  CalendarDays,
  Star,
  X,
  Pencil,
  ArrowLeft,
} from "lucide-react";
import "./index.css";

type BookStatus =
  | "Quero ler"
  | "Lendo"
  | "Terminado"
  | "Pausado"
  | "Abandonado";

type Book = {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  pages: number;
  currentPage: number;
  rating: number;
  favorite: boolean;
  genre: string;
  startDate: string;
  finishDate: string;
  review: string;
  cover: string;
};

type ReadingGoals = {
  year: number;
  annualBooks: number;
  monthlyBooks: number;
};

type LibrisSettings = {
  profileName: string;
  profileEmoji: string;
  favoriteGenre: string;
  notifications: boolean;
  theme: "light" | "dark";
};

const defaultSettings: LibrisSettings = {
  profileName: "Leitora",
  profileEmoji: "📚",
  favoriteGenre: "Fantasia",
  notifications: true,
  theme: "light",
};

type DiaryEntry = {
  id: string;
  bookId: string;
  date: string;
  page: number;
  mood: string;
  text: string;
};

type ReadingList = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  bookIds: string[];
};

const defaultGoals: ReadingGoals = {
  year: new Date().getFullYear(),
  annualBooks: 50,
  monthlyBooks: 4,
};

const defaultDiaryEntries: DiaryEntry[] = [];

const demoBooks: Book[] = [
  {
    id: "demo-1",
    title: "Quarta Asa",
    author: "Rebecca Yarros",
    status: "Lendo",
    pages: 528,
    currentPage: 327,
    rating: 5,
    favorite: true,
    genre: "Fantasia Romântica",
    startDate: "2026-09-10",
    finishDate: "",
    review: "",
    cover: "",
  },
];

const menuItems = [
  { icon: BookOpen, label: "Início", page: "home" },
  { icon: Library, label: "Minha Biblioteca", page: "library" },
  { icon: Plus, label: "Adicionar livro", page: "add" },
  { icon: BarChart3, label: "Estatísticas", page: "stats" },
  { icon: Target, label: "Metas", page: "goals" },
  { icon: NotebookPen, label: "Diário", page: "diary" },
  { icon: Heart, label: "Favoritos", page: "favorites" },
  { icon: List, label: "Listas", page: "lists" },
  { icon: Settings, label: "Configurações", page: "settings" },
];

function App() {
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem("libris-books");

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return demoBooks;
      }
    }

    return demoBooks;
  });

  const [goals, setGoals] = useState<ReadingGoals>(() => {
    const saved = localStorage.getItem("libris-goals");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        return {
          year:
            Number(parsed.year) ||
            new Date().getFullYear(),
          annualBooks:
            Math.max(
              Number(parsed.annualBooks) || 50,
              1
            ),
          monthlyBooks:
            Math.max(
              Number(parsed.monthlyBooks) || 4,
              1
            ),
        };
      } catch {
        return defaultGoals;
      }
    }

    return defaultGoals;
  });

  const [diaryEntries, setDiaryEntries] =
    useState<DiaryEntry[]>(() => {
      const saved = localStorage.getItem(
        "libris-diary"
      );

      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return defaultDiaryEntries;
        }
      }

      return defaultDiaryEntries;
    });

  const [lists, setLists] = useState<ReadingList[]>(() => {
    const saved = localStorage.getItem("libris-lists");

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }

    return [];
  });


  const [settings, setSettings] = useState<LibrisSettings>(() => {
    const saved = localStorage.getItem("libris-settings");

    if (saved) {
      try {
        return {
          ...defaultSettings,
          ...JSON.parse(saved),
        };
      } catch {
        return defaultSettings;
      }
    }

    return defaultSettings;
  });
  const [page, setPage] = useState("home");
  const [search, setSearch] = useState("");
  const [showDemoMessage, setShowDemoMessage] =
    useState(true);

  const [selectedBook, setSelectedBook] =
    useState<Book | null>(null);

  const [editingBook, setEditingBook] =
    useState<Book | null>(null);

  useEffect(() => {
    localStorage.setItem(
      "libris-books",
      JSON.stringify(books)
    );
  }, [books]);

  useEffect(() => {
    localStorage.setItem(
      "libris-goals",
      JSON.stringify(goals)
    );
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(
      "libris-diary",
      JSON.stringify(diaryEntries)
    );
  }, [diaryEntries]);

  useEffect(() => {
    localStorage.setItem(
      "libris-lists",
      JSON.stringify(lists)
    );
  }, [lists]);

  useEffect(() => {
    localStorage.setItem(
      "libris-settings",
      JSON.stringify(settings)
    );
  }, [settings]);

  const finishedBooks = books.filter(
    (book) => book.status === "Terminado"
  );

  const favoriteBooks = books.filter(
    (book) => book.favorite
  );

  const totalPages = finishedBooks.reduce(
    (total, book) => total + book.pages,
    0
  );

  const averageRating =
    finishedBooks.length > 0
      ? finishedBooks.reduce(
          (sum, book) => sum + book.rating,
          0
        ) / finishedBooks.length
      : 0;

  const currentBook = books.find(
    (book) => book.status === "Lendo"
  );

  const filteredBooks = useMemo(() => {
    const searchTerm = search
      .toLowerCase()
      .trim();

    if (!searchTerm) return books;

    return books.filter(
      (book) =>
        book.title
          .toLowerCase()
          .includes(searchTerm) ||
        book.author
          .toLowerCase()
          .includes(searchTerm) ||
        book.genre
          .toLowerCase()
          .includes(searchTerm)
    );
  }, [books, search]);

  function addBook(book: Omit<Book, "id">) {
    const newBook: Book = {
      ...book,
      id: crypto.randomUUID(),
    };

    setBooks((current) => [
      ...current,
      newBook,
    ]);

    setPage("library");
  }

  function updateBook(
    id: string,
    book: Omit<Book, "id">
  ) {
    setBooks((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...book,
              id,
            }
          : item
      )
    );

    setEditingBook(null);
    setSelectedBook(null);
    setPage("library");
  }

  function deleteBook(id: string) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este livro?"
    );

    if (!confirmed) return;

    setBooks((current) =>
      current.filter(
        (book) => book.id !== id
      )
    );

    if (selectedBook?.id === id) {
      setSelectedBook(null);
      setPage("library");
    }
  }

  function toggleFavorite(id: string) {
    setBooks((current) =>
      current.map((book) =>
        book.id === id
          ? {
              ...book,
              favorite: !book.favorite,
            }
          : book
      )
    );

    setSelectedBook((current) =>
      current?.id === id
        ? {
            ...current,
            favorite: !current.favorite,
          }
        : current
    );
  }

  function openBook(book: Book) {
    setSelectedBook(book);
    setPage("details");
  }

  function startEditing(book: Book) {
    setEditingBook(book);
    setSelectedBook(null);
    setPage("edit");
  }

  function goToPage(nextPage: string) {
    setPage(nextPage);
    setSelectedBook(null);
    setEditingBook(null);
  }

  return (
    <div className={`app ${settings.theme === "dark" ? "theme-dark" : ""}`}>
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">
            <BookOpen size={23} />
          </div>

          <div>
            <h1>Libris</h1>
            <span>meu diário literário</span>
          </div>
        </div>

        <nav>
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                className={`nav-item ${
                  page === item.page
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  goToPage(item.page)
                }
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="reading-quote">
            <span>“</span>

            <p>
              Uma história pode nos levar
              para lugares que nunca
              imaginamos conhecer.
            </p>
          </div>

          <small>
            Feito para quem ama ler ♡
          </small>
        </div>
      </aside>

      <main className="main">
        {showDemoMessage && (
          <div className="demo-message">
            <span>
              ✨ O Libris está usando um
              livro de demonstração. Você
              pode excluí-lo quando quiser.
            </span>

            <button
              onClick={() =>
                setShowDemoMessage(false)
              }
            >
              <X size={16} />
            </button>
          </div>
        )}

        {page === "home" && (
          <Home
            books={books}
            currentBook={currentBook}
            finishedBooks={finishedBooks}
            favoriteBooks={favoriteBooks}
            totalPages={totalPages}
            averageRating={averageRating}
            annualGoal={goals.annualBooks}
            goalYear={goals.year}
            onNavigate={goToPage}
            onOpenBook={openBook}
          />
        )}

        {page === "library" && (
          <LibraryPage
            books={filteredBooks}
            search={search}
            setSearch={setSearch}
            onNavigate={goToPage}
            onDelete={deleteBook}
            onFavorite={toggleFavorite}
            onOpen={openBook}
            onEdit={startEditing}
          />
        )}

        {page === "add" && (
          <AddBookPage
            onAdd={addBook}
            onCancel={() =>
              goToPage("home")
            }
          />
        )}

        {page === "edit" &&
          editingBook && (
            <AddBookPage
              onAdd={(book) =>
                updateBook(
                  editingBook.id,
                  book
                )
              }
              onCancel={() => {
                setEditingBook(null);
                setPage("library");
              }}
              initialBook={editingBook}
              editMode
            />
          )}

        {page === "details" &&
          selectedBook && (
            <BookDetailsPage
              book={selectedBook}
              onBack={() => {
                setSelectedBook(null);
                setPage("library");
              }}
              onEdit={startEditing}
              onFavorite={toggleFavorite}
              onDelete={deleteBook}
            />
          )}

        {page === "favorites" && (
          <FavoritesPage
            books={favoriteBooks}
            search={search}
            setSearch={setSearch}
            onNavigate={goToPage}
            onDelete={deleteBook}
            onFavorite={toggleFavorite}
            onOpen={openBook}
            onEdit={startEditing}
          />
        )}

        {page === "stats" && (
          <StatsPage books={books} />
        )}

        {page === "goals" && (
          <GoalsPage
            books={books}
            goals={goals}
            onSave={setGoals}
          />
        )}

        {page === "diary" && (
          <DiaryPage
            books={books}
            entries={diaryEntries}
            onSave={setDiaryEntries}
          />
        )}

        {page === "lists" && (
          <ListsPage
            books={books}
            lists={lists}
            onSave={setLists}
            onNavigate={goToPage}
            onDelete={deleteBook}
            onFavorite={toggleFavorite}
            onOpen={openBook}
            onEdit={startEditing}
          />
        )}

        {page === "settings" && (
          <SettingsPage
            settings={settings}
            books={books}
            diaryEntries={diaryEntries}
            goals={goals}
            lists={lists}
            onSave={setSettings}
            onClearDemoBook={() => {
              setBooks((current) =>
                current.filter((book) => book.id !== "demo-1")
              );
            }}
            onResetAll={() => {
              setBooks([]);
              setGoals(defaultGoals);
              setDiaryEntries([]);
              setLists([]);
              setSettings(defaultSettings);
              setSelectedBook(null);
              setEditingBook(null);
            }}
          />
        )}
      </main>
    </div>
  );
}

/* =========================================
   HOME
   ========================================= */

function Home({
  books,
  currentBook,
  finishedBooks,
  favoriteBooks,
  totalPages,
  averageRating,
  annualGoal,
  goalYear,
  onNavigate,
  onOpenBook,
}: {
  books: Book[];
  currentBook?: Book;
  finishedBooks: Book[];
  favoriteBooks: Book[];
  totalPages: number;
  averageRating: number;
  annualGoal: number;
  goalYear: number;
  onNavigate: (page: string) => void;
  onOpenBook: (book: Book) => void;
}) {
  const goalProgress =
    annualGoal > 0
      ? Math.min(
          (finishedBooks.length /
            annualGoal) *
            100,
          100
        )
      : 0;

  return (
    <>
      <header className="topbar">
        <div>
          <span className="welcome-small">
            SEU CANTINHO DE LEITURA
          </span>

          <h2>Olá, leitora! 📖</h2>
        </div>

        <button
          className="search-button"
          onClick={() =>
            onNavigate("library")
          }
        >
          <Search size={19} />
          <span>Pesquisar...</span>
        </button>
      </header>

      <section className="hero">
        <div>
          <span className="eyebrow">
            SEU DIÁRIO LITERÁRIO
          </span>

          <h3>
            Pronta para mais uma história?
          </h3>

          <p>
            Acompanhe suas leituras,
            registre seus momentos
            favoritos e descubra sua
            própria jornada literária.
          </p>
        </div>

        <div className="hero-decoration">
          <BookOpen
            size={62}
            strokeWidth={1.2}
          />
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          icon="📚"
          number={finishedBooks.length}
          label="Livros lidos"
        />

        <StatCard
          icon="📄"
          number={totalPages.toLocaleString(
            "pt-BR"
          )}
          label="Páginas lidas"
        />

        <StatCard
          icon="⭐"
          number={
            averageRating
              ? averageRating
                  .toFixed(1)
                  .replace(".", ",")
              : "—"
          }
          label="Média das avaliações"
        />

        <StatCard
          icon="❤️"
          number={favoriteBooks.length}
          label="Favoritos absolutos"
        />
      </section>

      <section className="content-grid">
        <div className="goal-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                MINHA META
              </span>

              <h3>
                Meta de leitura de {goalYear}
              </h3>
            </div>

            <Target size={23} />
          </div>

          <div className="goal-numbers">
            <strong>
              {finishedBooks.length}
            </strong>

            <span>
              {" "}
              / {annualGoal} livros
            </span>
          </div>

          <div className="progress">
            <div
              className="progress-fill"
              style={{
                width: `${goalProgress}%`,
              }}
            />
          </div>

          <div className="progress-info">
            <span>
              {Math.round(
                goalProgress
              )}
              % concluído
            </span>

            <span>
              {Math.max(
                annualGoal -
                  finishedBooks.length,
                0
              )}{" "}
              restantes
            </span>
          </div>

          <button
            className="outline-button"
            onClick={() =>
              onNavigate("goals")
            }
          >
            <Target size={17} />
            Ver minhas metas
          </button>
        </div>

        <div className="current-book">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                AGORA
              </span>

              <h3>Estou lendo</h3>
            </div>

            <BookOpen size={23} />
          </div>

          {currentBook ? (
            <div className="book-reading">
              <BookCover
                book={currentBook}
              />

              <div className="book-info">
                <span className="book-status">
                  LENDO AGORA
                </span>

                <h4>
                  {currentBook.title}
                </h4>

                <p>
                  {currentBook.author}
                </p>

                <div className="reading-progress">
                  <div className="progress">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${
                          currentBook.pages
                            ? Math.min(
                                (currentBook.currentPage /
                                  currentBook.pages) *
                                  100,
                                100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <div className="progress-info">
                    <span>
                      {
                        currentBook.currentPage
                      }{" "}
                      /{" "}
                      {
                        currentBook.pages
                      }{" "}
                      páginas
                    </span>

                    <strong>
                      {currentBook.pages
                        ? Math.round(
                            (currentBook.currentPage /
                              currentBook.pages) *
                              100
                          )
                        : 0}
                      %
                    </strong>
                  </div>
                </div>

                <button
                  className="primary-button"
                  onClick={() =>
                    onOpenBook(
                      currentBook
                    )
                  }
                >
                  Ver livro
                </button>
              </div>
            </div>
          ) : (
            <div className="no-current-book">
              <BookOpen size={30} />

              <p>
                Nenhum livro marcado como
                "Lendo".
              </p>

              <button
                className="outline-button"
                onClick={() =>
                  onNavigate("add")
                }
              >
                <Plus size={17} />
                Adicionar livro
              </button>
            </div>
          )}
        </div>
      </section>

      {books.length === 0 && (
        <section className="empty-section">
          <div className="empty-icon">
            <Heart size={22} />
          </div>

          <div>
            <span className="eyebrow">
              SUA COLEÇÃO
            </span>

            <h3>
              Seu cantinho está começando
            </h3>

            <p>
              Adicione seus livros para
              começar a construir sua
              biblioteca pessoal.
            </p>
          </div>

          <button
            className="outline-button"
            onClick={() =>
              onNavigate("add")
            }
          >
            <Plus size={18} />
            Adicionar primeiro livro
          </button>
        </section>
      )}
    </>
  );
}

function StatCard({
  icon,
  number,
  label,
}: {
  icon: string;
  number: string | number;
  label: string;
}) {
  return (
    <div className="stat-card">
      <span className="stat-icon">
        {icon}
      </span>

      <div>
        <strong>{number}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

/* =========================================
   BIBLIOTECA
   ========================================= */

function FavoritesPage({
  books,
  search,
  setSearch,
  onNavigate,
  onDelete,
  onFavorite,
  onOpen,
  onEdit,
}: {
  books: Book[];
  search: string;
  setSearch: (value: string) => void;
  onNavigate: (page: string) => void;
  onDelete: (id: string) => void;
  onFavorite: (id: string) => void;
  onOpen: (book: Book) => void;
  onEdit: (book: Book) => void;
}) {
  const filteredFavorites = books.filter((book) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return (
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.genre.toLowerCase().includes(query)
    );
  });

  const lovedBooks = books.filter(
    (book) => book.rating === 5 && book.favorite
  ).length;

  return (
    <>
      <header className="topbar">
        <div>
          <span className="welcome-small">
            MEU CANTINHO ESPECIAL
          </span>

          <h2>Meus favoritos ❤️</h2>
        </div>

        <button
          className="primary-button"
          onClick={() => onNavigate("add")}
        >
          <Plus size={18} />
          Adicionar livro
        </button>
      </header>

      <section
        className="stats-intro"
        style={{ marginBottom: "24px" }}
      >
        <div>
          <span className="eyebrow">
            LIVROS QUE MORAM NO CORAÇÃO
          </span>

          <h1>
            Seus favoritos, reunidos em um só lugar. 💗
          </h1>

          <p>
            Aqui ficam os livros que você marcou com ❤️.
            Você pode abrir, editar ou retirar um livro dos
            favoritos quando quiser.
          </p>
        </div>

        <div
          style={{
            minWidth: "92px",
            height: "92px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f0dfe1",
          }}
        >
          <Heart
            size={42}
            fill="currentColor"
          />
        </div>
      </section>

      <section
        className="stats-grid"
        style={{ marginBottom: "24px" }}
      >
        <div className="stat-card">
          <span className="stat-icon">❤️</span>
          <div>
            <strong>{books.length}</strong>
            <span>Favoritos</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">⭐</span>
          <div>
            <strong>{lovedBooks}</strong>
            <span>5 estrelas + ❤️</span>
          </div>
        </div>
      </section>

      <div className="library-search">
        <Search size={19} />

        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Pesquisar nos favoritos..."
        />
      </div>

      {filteredFavorites.length === 0 ? (
        <section className="empty-section">
          <div className="empty-icon">
            <Heart size={22} />
          </div>

          <div>
            <span className="eyebrow">
              {books.length === 0
                ? "SEU CORAÇÃO ESTÁ ESPERANDO"
                : "NENHUM RESULTADO"}
            </span>

            <h3>
              {books.length === 0
                ? "Ainda não há livros favoritos"
                : "Nenhum favorito encontrado"}
            </h3>

            <p>
              {books.length === 0
                ? "Quando você clicar no coração de um livro, ele aparecerá aqui."
                : "Tente pesquisar por outro título, autor ou gênero."}
            </p>
          </div>

          {books.length === 0 && (
            <button
              className="outline-button"
              onClick={() => onNavigate("library")}
            >
              <Library size={18} />
              Ir para minha biblioteca
            </button>
          )}
        </section>
      ) : (
        <div className="books-grid">
          {filteredFavorites.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onDelete={onDelete}
              onFavorite={onFavorite}
              onOpen={onOpen}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </>
  );
}

function LibraryPage({
  books,
  title = "Minha Biblioteca",
  search,
  setSearch,
  onNavigate,
  onDelete,
  onFavorite,
  onOpen,
  onEdit,
}: {
  books: Book[];
  title?: string;
  search: string;
  setSearch: (value: string) => void;
  onNavigate: (page: string) => void;
  onDelete: (id: string) => void;
  onFavorite: (id: string) => void;
  onOpen: (book: Book) => void;
  onEdit: (book: Book) => void;
}) {
  return (
    <>
      <header className="topbar">
        <div>
          <span className="welcome-small">
            MINHA COLEÇÃO
          </span>

          <h2>{title}</h2>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            onNavigate("add")
          }
        >
          <Plus size={18} />
          Adicionar livro
        </button>
      </header>

      <div className="library-search">
        <Search size={19} />

        <input
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Pesquisar por título, autor ou gênero..."
        />
      </div>

      {books.length === 0 ? (
        <div className="library-empty">
          <Library size={42} />

          <h3>
            Nenhum livro encontrado
          </h3>

          <p>
            Experimente outra pesquisa ou
            adicione um novo livro.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              onNavigate("add")
            }
          >
            <Plus size={18} />
            Adicionar livro
          </button>
        </div>
      ) : (
        <div className="books-grid">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onDelete={onDelete}
              onFavorite={onFavorite}
              onOpen={onOpen}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </>
  );
}

function BookCard({
  book,
  onDelete,
  onFavorite,
  onOpen,
  onEdit,
}: {
  book: Book;
  onDelete: (id: string) => void;
  onFavorite: (id: string) => void;
  onOpen: (book: Book) => void;
  onEdit: (book: Book) => void;
}) {
  const progress =
    book.pages > 0
      ? Math.min(
          Math.round(
            (book.currentPage /
              book.pages) *
              100
          ),
          100
        )
      : 0;

  return (
    <article className="book-card">
      <button
        className="book-card-cover-button"
        onClick={() => onOpen(book)}
        title="Ver detalhes"
      >
        <BookCover book={book} />
      </button>

      <button
        className={`favorite-button ${
          book.favorite
            ? "favorite-active"
            : ""
        }`}
        onClick={() =>
          onFavorite(book.id)
        }
        title="Favoritar"
      >
        <Heart
          size={18}
          fill={
            book.favorite
              ? "currentColor"
              : "none"
          }
        />
      </button>

      <div className="book-card-info">
        <span className="book-card-status">
          {book.status}
        </span>

        <button
          className="book-title-button"
          onClick={() => onOpen(book)}
        >
          {book.title}
        </button>

        <p>{book.author}</p>

        {book.status === "Lendo" && (
          <div className="card-progress">
            <div className="progress">
              <div
                className="progress-fill"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <span>
              {progress}% lido
            </span>
          </div>
        )}

        <div className="book-rating">
          <Star
            size={15}
            fill="currentColor"
          />

          {book.rating || "—"}
        </div>

        <div className="book-card-actions">
          <button
            className="details-button"
            onClick={() =>
              onOpen(book)
            }
          >
            Ver detalhes
          </button>

          <button
            className="edit-button"
            onClick={() =>
              onEdit(book)
            }
            title="Editar"
          >
            <Pencil size={16} />
          </button>

          <button
            className="delete-button"
            onClick={() =>
              onDelete(book.id)
            }
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

function BookCover({
  book,
}: {
  book: Book;
}) {
  if (book.cover) {
    return (
      <div className="book-cover">
        <img
          src={book.cover}
          alt={`Capa de ${book.title}`}
        />
      </div>
    );
  }

  return (
    <div className="book-cover">
      <div className="cover-inner">
        <span>
          {book.genre || "LIVRO"}
        </span>

        <strong>
          {book.title}
        </strong>

        <small>
          {book.author}
        </small>
      </div>
    </div>
  );
}

/* =========================================
   DETALHES DO LIVRO
   ========================================= */

function BookDetailsPage({
  book,
  onBack,
  onEdit,
  onFavorite,
  onDelete,
}: {
  book: Book;
  onBack: () => void;
  onEdit: (book: Book) => void;
  onFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const progress =
    book.pages > 0
      ? Math.min(
          Math.round(
            (book.currentPage /
              book.pages) *
              100
          ),
          100
        )
      : 0;

  function formatDate(date: string) {
    if (!date) return "Não informado";

    const [
      year,
      month,
      day,
    ] = date.split("-");

    if (
      !year ||
      !month ||
      !day
    ) {
      return date;
    }

    return `${day}/${month}/${year}`;
  }

  return (
    <div className="book-details-page">
      <button
        className="back-button"
        onClick={onBack}
      >
        <ArrowLeft size={18} />
        Voltar para a biblioteca
      </button>

      <section className="book-details-hero">
        <div className="details-cover">
          <BookCover book={book} />
        </div>

        <div className="details-main">
          <div className="details-top-line">
            <span className="book-card-status">
              {book.status}
            </span>

            <button
              className={`details-favorite-button ${
                book.favorite
                  ? "favorite-active"
                  : ""
              }`}
              onClick={() =>
                onFavorite(book.id)
              }
            >
              <Heart
                size={20}
                fill={
                  book.favorite
                    ? "currentColor"
                    : "none"
                }
              />

              {book.favorite
                ? "Favorito"
                : "Adicionar aos favoritos"}
            </button>
          </div>

          <h1>{book.title}</h1>

          <p className="details-author">
            por {book.author}
          </p>

          {book.genre && (
            <div className="genre-tag">
              {book.genre}
            </div>
          )}

          <div className="details-rating">
            <div className="stars">
              {Array.from(
                { length: 5 },
                (_, index) => {
                  const filled =
                    index <
                    Math.round(
                      book.rating
                    );

                  return (
                    <Star
                      key={index}
                      size={22}
                      fill={
                        filled
                          ? "currentColor"
                          : "none"
                      }
                    />
                  );
                }
              )}
            </div>

            <strong>
              {book.rating
                ? `${book.rating
                    .toString()
                    .replace(
                      ".",
                      ","
                    )} / 5`
                : "Sem avaliação"}
            </strong>
          </div>

          <div className="details-actions">
            <button
              className="primary-button"
              onClick={() =>
                onEdit(book)
              }
            >
              <Pencil size={18} />
              Editar livro
            </button>

            <button
              className="outline-button danger-outline"
              onClick={() =>
                onDelete(book.id)
              }
            >
              <Trash2 size={18} />
              Excluir
            </button>
          </div>
        </div>
      </section>

      <section className="details-grid">
        <div className="details-card">
          <div className="details-card-title">
            <BookOpen size={20} />

            <h3>
              Informações da leitura
            </h3>
          </div>

          <div className="details-info-grid">
            <div>
              <span>Páginas</span>

              <strong>
                {book.pages || "—"}
              </strong>
            </div>

            <div>
              <span>Página atual</span>

              <strong>
                {book.currentPage || 0}
              </strong>
            </div>

            <div>
              <span>Comecei em</span>

              <strong>
                {formatDate(
                  book.startDate
                )}
              </strong>
            </div>

            <div>
              <span>Terminei em</span>

              <strong>
                {formatDate(
                  book.finishDate
                )}
              </strong>
            </div>
          </div>

          {book.pages > 0 && (
            <div className="details-progress">
              <div className="details-progress-heading">
                <span>
                  Progresso da leitura
                </span>

                <strong>
                  {progress}%
                </strong>
              </div>

              <div className="progress">
                <div
                  className="progress-fill"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

              <small>
                {book.currentPage} de{" "}
                {book.pages} páginas
              </small>
            </div>
          )}
        </div>

        <div className="details-card">
          <div className="details-card-title">
            <Heart size={20} />

            <h3>
              Meu sentimento
            </h3>
          </div>

          {book.favorite ? (
            <div className="love-message">
              <Heart
                size={30}
                fill="currentColor"
              />

              <div>
                <strong>
                  Esse livro é um favorito! ❤️
                </strong>

                <p>
                  Você marcou esse livro
                  como um dos seus
                  favoritos.
                </p>
              </div>
            </div>
          ) : (
            <div className="love-message muted">
              <Heart size={30} />

              <div>
                <strong>
                  Ainda não é um favorito
                </strong>

                <p>
                  Você pode marcar esse
                  livro como favorito
                  quando quiser.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="review-card">
        <div className="details-card-title">
          <NotebookPen size={20} />

          <h3>Minha resenha</h3>
        </div>

        {book.review.trim() ? (
          <p className="review-text">
            {book.review}
          </p>
        ) : (
          <div className="empty-review">
            <NotebookPen size={25} />

            <p>
              Você ainda não escreveu
              uma resenha para este
              livro.
            </p>

            <button
              className="outline-button"
              onClick={() =>
                onEdit(book)
              }
            >
              <Pencil size={16} />
              Escrever resenha
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

/* =========================================
   ADICIONAR / EDITAR LIVRO
   ========================================= */

function AddBookPage({
  onAdd,
  onCancel,
  initialBook,
  editMode = false,
}: {
  onAdd: (
    book: Omit<Book, "id">
  ) => void;

  onCancel: () => void;

  initialBook?: Book;

  editMode?: boolean;
}) {
  const [title, setTitle] =
    useState(
      initialBook?.title ?? ""
    );

  const [author, setAuthor] =
    useState(
      initialBook?.author ?? ""
    );

  const [status, setStatus] =
    useState<BookStatus>(
      initialBook?.status ??
        "Quero ler"
    );

  const [pages, setPages] =
    useState(
      initialBook?.pages
        ? String(
            initialBook.pages
          )
        : ""
    );

  const [currentPage, setCurrentPage] =
    useState(
      initialBook?.currentPage
        ? String(
            initialBook.currentPage
          )
        : "0"
    );

  const [rating, setRating] =
    useState(
      initialBook?.rating ?? 0
    );

  const [favorite, setFavorite] =
    useState(
      initialBook?.favorite ??
        false
    );

  const [genre, setGenre] =
    useState(
      initialBook?.genre ?? ""
    );

  const [startDate, setStartDate] =
    useState(
      initialBook?.startDate ?? ""
    );

  const [finishDate, setFinishDate] =
    useState(
      initialBook?.finishDate ?? ""
    );

  const [review, setReview] =
    useState(
      initialBook?.review ?? ""
    );

  const [cover, setCover] =
    useState(
      initialBook?.cover ?? ""
    );

  function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    if (
      !title.trim() ||
      !author.trim()
    ) {
      alert(
        "Preencha pelo menos o título e o autor."
      );

      return;
    }

    onAdd({
      title: title.trim(),
      author: author.trim(),
      status,
      pages: Number(pages) || 0,
      currentPage:
        Number(currentPage) || 0,
      rating,
      favorite,
      genre,
      startDate,
      finishDate,
      review,
      cover,
    });
  }

  return (
    <>
      <header className="topbar">
        <div>
          <span className="welcome-small">
            MINHA COLEÇÃO
          </span>

          <h2>
            {editMode
              ? "Editar livro"
              : "Adicionar livro"}
          </h2>
        </div>
      </header>

      <form
        className="book-form"
        onSubmit={handleSubmit}
      >
        <div className="form-section">
          <div className="form-section-title">
            <BookOpen size={20} />

            <div>
              <h3>
                Informações principais
              </h3>

              <p>
                Comece pelo essencial.
              </p>
            </div>
          </div>

          <div className="form-grid">
            <label>
              Título *

              <input
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target
                      .value
                  )
                }
                placeholder="Ex.: Quarta Asa"
              />
            </label>

            <label>
              Autor *

              <input
                value={author}
                onChange={(event) =>
                  setAuthor(
                    event.target
                      .value
                  )
                }
                placeholder="Ex.: Rebecca Yarros"
              />
            </label>

            <label>
              Status *

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target
                      .value as BookStatus
                  )
                }
              >
                <option>
                  Quero ler
                </option>

                <option>
                  Lendo
                </option>

                <option>
                  Terminado
                </option>

                <option>
                  Pausado
                </option>

                <option>
                  Abandonado
                </option>
              </select>
            </label>

            <label>
              Gênero

              <input
                value={genre}
                onChange={(event) =>
                  setGenre(
                    event.target
                      .value
                  )
                }
                placeholder="Ex.: Fantasia Romântica"
              />
            </label>

            <label>
              Número de páginas

              <input
                type="number"
                min="0"
                value={pages}
                onChange={(event) =>
                  setPages(
                    event.target
                      .value
                  )
                }
                placeholder="528"
              />
            </label>

            <label>
              Página atual

              <input
                type="number"
                min="0"
                value={currentPage}
                onChange={(event) =>
                  setCurrentPage(
                    event.target
                      .value
                  )
                }
                placeholder="0"
              />
            </label>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">
            <CalendarDays size={20} />

            <div>
              <h3>
                Minha leitura
              </h3>

              <p>
                Registre quando sua
                história começou e
                terminou.
              </p>
            </div>
          </div>

          <div className="form-grid">
            <label>
              Comecei em

              <input
                type="date"
                value={startDate}
                onChange={(event) =>
                  setStartDate(
                    event.target
                      .value
                  )
                }
              />
            </label>

            <label>
              Terminei em

              <input
                type="date"
                value={finishDate}
                onChange={(event) =>
                  setFinishDate(
                    event.target
                      .value
                  )
                }
              />
            </label>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">
            <Star size={20} />

            <div>
              <h3>
                Minha avaliação
              </h3>

              <p>
                Escolha sua nota de 0,5 até
                5 estrelas.
              </p>
            </div>
          </div>

          <div className="rating-selector">
            {[
              0.5,
              1,
              1.5,
              2,
              2.5,
              3,
              3.5,
              4,
              4.5,
              5,
            ].map((value) => (
              <button
                type="button"
                key={value}
                className={
                  rating === value
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  setRating(value)
                }
              >
                {value} ⭐
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`love-button ${
              favorite
                ? "selected"
                : ""
            }`}
            onClick={() =>
              setFavorite(
                !favorite
              )
            }
          >
            <Heart
              size={19}
              fill={
                favorite
                  ? "currentColor"
                  : "none"
              }
            />

            Amei MUITO
          </button>
        </div>

        <div className="form-section">
          <div className="form-section-title">
            <NotebookPen size={20} />

            <div>
              <h3>
                Minha resenha
              </h3>

              <p>
                Escreva o que você
                achou da leitura.
              </p>
            </div>
          </div>

          <label>
            Minha resenha

            <textarea
              value={review}
              onChange={(event) =>
                setReview(
                  event.target
                    .value
                )
              }
              placeholder="O que você achou desse livro?"
              rows={7}
            />
          </label>
        </div>

        <div className="form-section">
          <div className="form-section-title">
            <Library size={20} />

            <div>
              <h3>
                Detalhes opcionais
              </h3>

              <p>
                Você pode colocar a
                imagem da capa aqui.
              </p>
            </div>
          </div>

          <label>
            URL da capa

            <input
              value={cover}
              onChange={(event) =>
                setCover(
                  event.target
                    .value
                )
              }
              placeholder="https://..."
            />
          </label>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="outline-button"
            onClick={onCancel}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="primary-button"
          >
            {editMode ? (
              <Pencil size={18} />
            ) : (
              <BookOpen size={18} />
            )}

            {editMode
              ? "Salvar alterações"
              : "Salvar livro"}
          </button>
        </div>
      </form>
    </>
  );
}

/* =========================================
   ESTATÍSTICAS
   ========================================= */

function StatsPage({
  books,
}: {
  books: Book[];
}) {
  const finishedBooks =
    books.filter(
      (book) =>
        book.status === "Terminado"
    );

  const totalBooks =
    finishedBooks.length;

  const totalPages =
    finishedBooks.reduce(
      (total, book) =>
        total + book.pages,
      0
    );

  const favoriteBooks =
    books.filter(
      (book) => book.favorite
    ).length;

  const abandonedBooks =
    books.filter(
      (book) =>
        book.status ===
        "Abandonado"
    ).length;

  const ratedBooks =
    finishedBooks.filter(
      (book) => book.rating > 0
    );

  const averageRating =
    ratedBooks.length > 0
      ? ratedBooks.reduce(
          (sum, book) =>
            sum + book.rating,
          0
        ) / ratedBooks.length
      : 0;

  const genreCount: Record<
    string,
    number
  > = {};

  finishedBooks.forEach(
    (book) => {
      const genre =
        book.genre.trim() ||
        "Sem gênero";

      genreCount[genre] =
        (genreCount[genre] || 0) +
        1;
    }
  );

  const genres = Object.entries(
    genreCount
  )
    .sort(
      (a, b) => b[1] - a[1]
    )
    .slice(0, 6);

  const monthNames = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  const booksByMonth =
    monthNames.map(
      (month, index) => {
        const count =
          finishedBooks.filter(
            (book) => {
              if (!book.finishDate)
                return false;

              const date =
                new Date(
                  `${book.finishDate}T00:00:00`
                );

              return (
                date.getMonth() ===
                index
              );
            }
          ).length;

        return {
          month,
          count,
        };
      }
    );

  const ratings = [
    0.5,
    1,
    1.5,
    2,
    2.5,
    3,
    3.5,
    4,
    4.5,
    5,
  ];

  const ratingCount =
    ratings.map(
      (rating) => ({
        rating,
        count:
          finishedBooks.filter(
            (book) =>
              book.rating ===
              rating
          ).length,
      })
    );

  const maxMonth =
    Math.max(
      ...booksByMonth.map(
        (item) =>
          item.count
      ),
      1
    );

  const maxGenre =
    Math.max(
      ...genres.map(
        (item) =>
          item[1]
      ),
      1
    );

  const maxRating =
    Math.max(
      ...ratingCount.map(
        (item) =>
          item.count
      ),
      1
    );

  return (
    <>
      <header className="topbar">
        <div>
          <span className="welcome-small">
            MINHA JORNADA LITERÁRIA
          </span>

          <h2>
            Minhas estatísticas 📊
          </h2>
        </div>
      </header>

      <section className="stats-intro">
        <div>
          <span className="eyebrow">
            MEU ANO DE LEITURA
          </span>

          <h3>
            Cada livro conta uma
            história. ❤️
          </h3>

          <p>
            Aqui você pode acompanhar
            sua jornada de leitura e
            descobrir seus hábitos
            literários.
          </p>
        </div>

        <div className="stats-intro-icon">
          <BarChart3 size={55} />
        </div>
      </section>

      <section className="stats-overview">
        <div className="big-stat-card">
          <span>📚</span>

          <strong>
            {totalBooks}
          </strong>

          <p>Livros lidos</p>
        </div>

        <div className="big-stat-card">
          <span>📖</span>

          <strong>
            {totalPages.toLocaleString(
              "pt-BR"
            )}
          </strong>

          <p>Páginas lidas</p>
        </div>

        <div className="big-stat-card">
          <span>⭐</span>

          <strong>
            {averageRating
              ? averageRating
                  .toFixed(1)
                  .replace(
                    ".",
                    ","
                  )
              : "—"}
          </strong>

          <p>
            Média das avaliações
          </p>
        </div>

        <div className="big-stat-card">
          <span>❤️</span>

          <strong>
            {favoriteBooks}
          </strong>

          <p>Favoritos</p>
        </div>

        <div className="big-stat-card">
          <span>🥀</span>

          <strong>
            {abandonedBooks}
          </strong>

          <p>Abandonados</p>
        </div>
      </section>

      <section className="statistics-card">
        <div className="statistics-card-header">
          <div>
            <span className="eyebrow">
              RITMO DE LEITURA
            </span>

            <h3>
              Livros lidos por mês
            </h3>

            <p>
              Considerando a data em
              que você terminou cada
              livro.
            </p>
          </div>

          <CalendarDays size={24} />
        </div>

        <div className="month-chart">
          {booksByMonth.map(
            (item) => (
              <div
                className="month-column"
                key={item.month}
              >
                <div className="month-value">
                  {item.count > 0
                    ? item.count
                    : ""}
                </div>

                <div className="month-bar-container">
                  <div
                    className="month-bar"
                    style={{
                      height: `${
                        item.count >
                        0
                          ? Math.max(
                              (item.count /
                                maxMonth) *
                                100,
                              8
                            )
                          : 3
                      }%`,
                    }}
                  />
                </div>

                <span>
                  {item.month}
                </span>
              </div>
            )
          )}
        </div>
      </section>

      <section className="statistics-two-columns">
        <div className="statistics-card">
          <div className="statistics-card-header">
            <div>
              <span className="eyebrow">
                MEUS GÊNEROS
              </span>

              <h3>
                O que eu mais leio
              </h3>
            </div>

            <Library size={24} />
          </div>

          {genres.length > 0 ? (
            <div className="genre-stat-list">
              {genres.map(
                ([genre, count]) => (
                  <div
                    className="genre-stat"
                    key={genre}
                  >
                    <div className="genre-stat-top">
                      <span>
                        {genre}
                      </span>

                      <strong>
                        {count}{" "}
                        {count === 1
                          ? "livro"
                          : "livros"}
                      </strong>
                    </div>

                    <div className="genre-bar">
                      <div
                        style={{
                          width: `${
                            (count /
                              maxGenre) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="statistics-empty">
              <Library size={30} />

              <p>
                Ainda não há livros
                terminados com gênero
                cadastrado.
              </p>
            </div>
          )}
        </div>

        <div className="statistics-card">
          <div className="statistics-card-header">
            <div>
              <span className="eyebrow">
                MINHAS NOTAS
              </span>

              <h3>
                Como eu avalio meus
                livros
              </h3>
            </div>

            <Star size={24} />
          </div>

          <div className="rating-chart">
            {ratingCount.map(
              ({
                rating,
                count,
              }) => (
                <div
                  className="rating-row"
                  key={rating}
                >
                  <span>
                    {rating
                      .toString()
                      .replace(
                        ".",
                        ","
                      )}
                    ⭐
                  </span>

                  <div className="rating-bar">
                    <div
                      style={{
                        width: `${
                          count > 0
                            ? (count /
                                maxRating) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <strong>
                    {count}
                  </strong>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section className="reading-summary">
        <div className="reading-summary-icon">
          <BookOpen size={25} />
        </div>

        <div>
          <span className="eyebrow">
            MINHA JORNADA
          </span>

          <h3>
            Você já leu{" "}
            {totalBooks}{" "}
            {totalBooks === 1
              ? "livro"
              : "livros"}!
          </h3>

          <p>
            {totalBooks === 0
              ? "Sua jornada literária está começando. Adicione e termine seu primeiro livro!"
              : `Ao todo, você já passou por ${totalPages.toLocaleString(
                  "pt-BR"
                )} páginas de histórias.`}
          </p>
        </div>
      </section>
    </>
  );
}

/* =========================================
   METAS
   ========================================= */

function GoalsPage({
  books,
  goals,
  onSave,
}: {
  books: Book[];
  goals: ReadingGoals;
  onSave: (goals: ReadingGoals) => void;
}) {
  const [editing, setEditing] =
    useState(false);

  const [annualBooks, setAnnualBooks] =
    useState(
      String(goals.annualBooks)
    );

  const [monthlyBooks, setMonthlyBooks] =
    useState(
      String(goals.monthlyBooks)
    );

  const finishedBooks =
    books.filter(
      (book) =>
        book.status === "Terminado"
    );

  const completed =
    finishedBooks.length;

  const annualProgress =
    goals.annualBooks > 0
      ? Math.min(
          (completed /
            goals.annualBooks) *
            100,
          100
        )
      : 0;

  const remaining = Math.max(
    goals.annualBooks -
      completed,
    0
  );

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const monthlyData =
    monthNames.map(
      (month, index) => {
        const count =
          finishedBooks.filter(
            (book) => {
              if (
                !book.finishDate
              ) {
                return false;
              }

              const date =
                new Date(
                  `${book.finishDate}T00:00:00`
                );

              return (
                date.getFullYear() ===
                  goals.year &&
                date.getMonth() ===
                  index
              );
            }
          ).length;

        const progress =
          goals.monthlyBooks > 0
            ? Math.min(
                (count /
                  goals.monthlyBooks) *
                  100,
                100
              )
            : 0;

        return {
          month,
          count,
          progress,
          completed:
            count >=
            goals.monthlyBooks,
        };
      }
    );

  function startEditing() {
    setAnnualBooks(
      String(goals.annualBooks)
    );

    setMonthlyBooks(
      String(goals.monthlyBooks)
    );

    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);

    setAnnualBooks(
      String(goals.annualBooks)
    );

    setMonthlyBooks(
      String(goals.monthlyBooks)
    );
  }

  function saveGoals(
    event: FormEvent
  ) {
    event.preventDefault();

    const annual =
      Math.max(
        Number(annualBooks) || 1,
        1
      );

    const monthly =
      Math.max(
        Number(monthlyBooks) || 1,
        1
      );

    onSave({
      ...goals,
      annualBooks: annual,
      monthlyBooks: monthly,
    });

    setEditing(false);
  }

  return (
    <>
      <header className="topbar">
        <div>
          <span className="welcome-small">
            MINHA JORNADA
          </span>

          <h2>
            Minhas metas 🎯
          </h2>
        </div>

        {!editing && (
          <button
            className="primary-button"
            onClick={startEditing}
          >
            <Pencil size={17} />
            Editar metas
          </button>
        )}
      </header>

      <section className="goals-intro">
        <div>
          <span className="eyebrow">
            METAS DE LEITURA
          </span>

          <h3>
            Pequenas metas, grandes
            histórias. 📚
          </h3>

          <p>
            Defina quanto você quer ler
            e acompanhe seu progresso
            ao longo do ano.
          </p>
        </div>

        <div className="goals-intro-icon">
          <Target size={58} />
        </div>
      </section>

      {editing ? (
        <form
          className="goal-edit-card"
          onSubmit={saveGoals}
        >
          <div className="statistics-card-header">
            <div>
              <span className="eyebrow">
                PERSONALIZAR
              </span>

              <h3>
                Como você quer que seja
                sua meta?
              </h3>

              <p>
                Você pode mudar esses
                números quando quiser.
              </p>
            </div>

            <Target size={24} />
          </div>

          <div className="goal-form-grid">
            <label>
              📚 Livros no ano

              <input
                type="number"
                min="1"
                value={annualBooks}
                onChange={(event) =>
                  setAnnualBooks(
                    event.target
                      .value
                  )
                }
              />

              <small>
                Quantos livros você quer
                terminar em {goals.year}?
              </small>
            </label>

            <label>
              📅 Livros por mês

              <input
                type="number"
                min="1"
                value={monthlyBooks}
                onChange={(event) =>
                  setMonthlyBooks(
                    event.target
                      .value
                  )
                }
              />

              <small>
                Uma referência para manter
                seu ritmo mensal.
              </small>
            </label>
          </div>

          <div className="goal-form-actions">
            <button
              type="button"
              className="outline-button"
              onClick={
                cancelEditing
              }
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="primary-button"
            >
              <Target size={17} />
              Salvar minhas metas
            </button>
          </div>
        </form>
      ) : (
        <>
          <section className="goal-main-card">
            <div className="goal-main-top">
              <div>
                <span className="eyebrow">
                  META ANUAL
                </span>

                <h3>
                  Minha meta de{" "}
                  {goals.year}
                </h3>

                <p>
                  Você já terminou{" "}
                  <strong>
                    {completed}
                  </strong>{" "}
                  {completed === 1
                    ? "livro"
                    : "livros"}.
                </p>
              </div>

              <div className="goal-big-number">
                <strong>
                  {completed}
                </strong>

                <span>
                  / {goals.annualBooks}
                </span>
              </div>
            </div>

            <div className="goal-progress-track">
              <div
                className="goal-progress-fill"
                style={{
                  width: `${annualProgress}%`,
                }}
              />
            </div>

            <div className="goal-progress-details">
              <span>
                {Math.round(
                  annualProgress
                )}
                % da meta concluída
              </span>

              <strong>
                {remaining === 0
                  ? "Meta alcançada! 🎉"
                  : `${remaining} ${
                      remaining === 1
                        ? "livro"
                        : "livros"
                    } restantes`}
              </strong>
            </div>
          </section>

          <section className="statistics-card">
            <div className="statistics-card-header">
              <div>
                <span className="eyebrow">
                  META MENSAL
                </span>

                <h3>
                  {goals.monthlyBooks}{" "}
                  {goals.monthlyBooks ===
                  1
                    ? "livro"
                    : "livros"}{" "}
                  por mês
                </h3>

                <p>
                  Acompanhe seu ritmo de
                  leitura mês a mês.
                </p>
              </div>

              <CalendarDays size={24} />
            </div>

            <div className="goal-months-grid">
              {monthlyData.map(
                (item) => (
                  <div
                    className={`goal-month-card ${
                      item.completed
                        ? "completed"
                        : ""
                    }`}
                    key={item.month}
                  >
                    <div className="goal-month-top">
                      <strong>
                        {item.month}
                      </strong>

                      <span>
                        {item.completed
                          ? "✓"
                          : `${item.count}/${goals.monthlyBooks}`}
                      </span>
                    </div>

                    <div className="goal-month-progress">
                      <div
                        style={{
                          width: `${item.progress}%`,
                        }}
                      />
                    </div>

                    <div className="goal-month-footer">
                      <span>
                        {item.count}{" "}
                        {item.count ===
                        1
                          ? "livro"
                          : "livros"}
                      </span>

                      {item.completed && (
                        <small>
                          Meta concluída
                        </small>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        </>
      )}
    </>
  );
}

/* =========================================
   DIÁRIO
   ========================================= */

function DiaryPage({
  books,
  entries,
  onSave,
}: {
  books: Book[];
  entries: DiaryEntry[];
  onSave: (entries: DiaryEntry[]) => void;
}) {
  const [showForm, setShowForm] =
    useState(false);

  const [bookId, setBookId] =
    useState(books[0]?.id ?? "");

  const [date, setDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [page, setPage] =
    useState("");

  const [mood, setMood] =
    useState("🥰");

  const [diaryText, setDiaryText] =
    useState("");

  const moods = [
    "🥰",
    "😍",
    "😊",
    "🥹",
    "😭",
    "😱",
    "🤍",
    "😴",
  ];

  function resetForm() {
    setBookId(books[0]?.id ?? "");
    setDate(
      new Date()
        .toISOString()
        .split("T")[0]
    );
    setPage("");
    setMood("🥰");
    setDiaryText("");
  }

  function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!bookId || !diaryText.trim()) {
      alert(
        "Escolha um livro e escreva alguma coisa no seu diário."
      );
      return;
    }

    const newEntry: DiaryEntry = {
      id: crypto.randomUUID(),
      bookId,
      date,
      page: Number(page) || 0,
      mood,
      text: diaryText.trim(),
    };

    onSave([
      newEntry,
      ...entries,
    ]);

    resetForm();
    setShowForm(false);
  }

  function deleteEntry(id: string) {
    const confirmed =
      window.confirm(
        "Tem certeza que deseja excluir esta anotação?"
      );

    if (!confirmed) return;

    onSave(
      entries.filter(
        (entry) => entry.id !== id
      )
    );
  }

  function formatDate(value: string) {
    if (!value) return "Sem data";

    const [
      year,
      month,
      day,
    ] = value.split("-");

    return `${day}/${month}/${year}`;
  }

  function getBook(entry: DiaryEntry) {
    return books.find(
      (book) => book.id === entry.bookId
    );
  }

  return (
    <>
      <header className="topbar">
        <div>
          <span className="welcome-small">
            MEU CANTINHO DE LEITURA
          </span>

          <h2>
            Meu diário 📔
          </h2>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            setShowForm(true)
          }
        >
          <NotebookPen size={18} />
          Nova anotação
        </button>
      </header>

      <section className="stats-intro">
        <div>
          <span className="eyebrow">
            DIÁRIO LITERÁRIO
          </span>

          <h3>
            Guarde cada momento da sua
            leitura. 💗
          </h3>

          <p>
            Registre o que você sentiu,
            onde parou e aqueles momentos
            que você nunca quer esquecer.
          </p>
        </div>

        <div className="stats-intro-icon">
          <NotebookPen size={55} />
        </div>
      </section>

      {showForm && (
        <form
          className="book-form"
          onSubmit={handleSubmit}
        >
          <div className="form-section">
            <div className="form-section-title">
              <NotebookPen size={20} />

              <div>
                <h3>
                  Nova anotação
                </h3>

                <p>
                  Conte como está sendo
                  sua leitura.
                </p>
              </div>
            </div>

            <div className="form-grid">
              <label>
                Livro *

                <select
                  value={bookId}
                  onChange={(event) =>
                    setBookId(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Selecione um livro
                  </option>

                  {books.map((book) => (
                    <option
                      key={book.id}
                      value={book.id}
                    >
                      {book.title}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Data *

                <input
                  type="date"
                  value={date}
                  onChange={(event) =>
                    setDate(
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Página em que estou

                <input
                  type="number"
                  min="0"
                  value={page}
                  onChange={(event) =>
                    setPage(
                      event.target.value
                    )
                  }
                  placeholder="Ex.: 327"
                />
              </label>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">
              <Heart size={20} />

              <div>
                <h3>
                  Como estou me sentindo?
                </h3>

                <p>
                  Escolha o emoji que
                  combina com o momento.
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              {moods.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() =>
                    setMood(item)
                  }
                  style={{
                    border:
                      mood === item
                        ? "2px solid currentColor"
                        : "1px solid #eadfdf",
                    borderRadius:
                      "14px",
                    background:
                      mood === item
                        ? "#fff0f4"
                        : "#fff",
                    padding:
                      "10px 14px",
                    fontSize: "24px",
                    cursor: "pointer",
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">
              <NotebookPen size={20} />

              <div>
                <h3>
                  O que aconteceu?
                </h3>

                <p>
                  Escreva livremente.
                </p>
              </div>
            </div>

            <label>
              Minha anotação *

              <textarea
                value={diaryText}
                onChange={(event) =>
                  setDiaryText(
                    event.target.value
                  )
                }
                placeholder="Ex.: Hoje aconteceu uma coisa que eu NÃO esperava..."
                rows={7}
              />
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="outline-button"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="primary-button"
            >
              <NotebookPen size={18} />
              Salvar no diário
            </button>
          </div>
        </form>
      )}

      {!showForm &&
        entries.length === 0 && (
          <section className="empty-section">
            <div className="empty-icon">
              <NotebookPen size={22} />
            </div>

            <div>
              <span className="eyebrow">
                SEU DIÁRIO
              </span>

              <h3>
                Sua primeira anotação
                começa aqui ✨
              </h3>

              <p>
                Registre aquele trecho,
                pensamento ou sentimento
                que você quer guardar.
              </p>
            </div>

            <button
              className="outline-button"
              onClick={() =>
                setShowForm(true)
              }
            >
              <Plus size={18} />
              Fazer primeira anotação
            </button>
          </section>
        )}

      {entries.length > 0 && (
        <section
          style={{
            display: "grid",
            gap: "18px",
          }}
        >
          {entries.map((entry) => {
            const book = getBook(entry);

            return (
              <article
                className="statistics-card"
                key={entry.id}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    gap: "16px",
                    alignItems:
                      "flex-start",
                  }}
                >
                  <div>
                    <span className="eyebrow">
                      {formatDate(
                        entry.date
                      )}{" "}
                      • {entry.mood}
                    </span>

                    <h3>
                      {book?.title ??
                        "Livro removido"}
                    </h3>

                    {book && (
                      <p>
                        {book.author}
                        {entry.page > 0
                          ? ` • Página ${entry.page}`
                          : ""}
                      </p>
                    )}
                  </div>

                  <button
                    className="delete-button"
                    onClick={() =>
                      deleteEntry(
                        entry.id
                      )
                    }
                    title="Excluir anotação"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <p
                  style={{
                    margin:
                      "18px 0 0",
                    lineHeight: 1.8,
                    whiteSpace:
                      "pre-wrap",
                  }}
                >
                  {entry.text}
                </p>
              </article>
            );
          })}
        </section>
      )}
    </>
  );
}

/* =========================================
   LISTAS
   ========================================= */

function ListsPage({
  books,
  lists,
  onSave,
  onNavigate,
  onDelete,
  onFavorite,
  onOpen,
  onEdit,
}: {
  books: Book[];
  lists: ReadingList[];
  onSave: (lists: ReadingList[]) => void;
  onNavigate: (page: string) => void;
  onDelete: (id: string) => void;
  onFavorite: (id: string) => void;
  onOpen: (book: Book) => void;
  onEdit: (book: Book) => void;
}) {
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("📚");
  const [bookSearch, setBookSearch] = useState("");

  const selectedList = lists.find(
    (list) => list.id === selectedListId
  );

  const listBooks = selectedList
    ? selectedList.bookIds
        .map((id) => books.find((book) => book.id === id))
        .filter((book): book is Book => Boolean(book))
    : [];

  const filteredBooks = books.filter((book) => {
    const query = bookSearch.trim().toLowerCase();

    if (!query) return true;

    return (
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.genre.toLowerCase().includes(query)
    );
  });

  function openNewList() {
    setEditingListId(null);
    setName("");
    setDescription("");
    setEmoji("📚");
    setShowForm(true);
  }

  function openEditList(list: ReadingList) {
    setSelectedListId(null);
    setEditingListId(list.id);
    setName(list.name);
    setDescription(list.description);
    setEmoji(list.emoji);
    setShowForm(true);
  }

  function saveList(event: FormEvent) {
    event.preventDefault();

    const cleanName = name.trim();

    if (!cleanName) {
      window.alert("Digite um nome para a lista.");
      return;
    }

    if (editingListId) {
      onSave(
        lists.map((list) =>
          list.id === editingListId
            ? {
                ...list,
                name: cleanName,
                description: description.trim(),
                emoji,
              }
            : list
        )
      );
    } else {
      const newList: ReadingList = {
        id: crypto.randomUUID(),
        name: cleanName,
        description: description.trim(),
        emoji,
        bookIds: [],
      };

      onSave([...lists, newList]);
      setSelectedListId(newList.id);
    }

    setShowForm(false);
    setEditingListId(null);
    setName("");
    setDescription("");
    setEmoji("📚");
  }

  function deleteList(listId: string) {
    const list = lists.find((item) => item.id === listId);

    if (!list) return;

    const confirmed = window.confirm(
      `Excluir a lista "${list.name}"? Os livros não serão excluídos da sua biblioteca.`
    );

    if (!confirmed) return;

    onSave(lists.filter((item) => item.id !== listId));
    setSelectedListId(null);
  }

  function toggleBook(bookId: string) {
    if (!selectedList) return;

    const hasBook = selectedList.bookIds.includes(bookId);

    onSave(
      lists.map((list) =>
        list.id === selectedList.id
          ? {
              ...list,
              bookIds: hasBook
                ? list.bookIds.filter((id) => id !== bookId)
                : [...list.bookIds, bookId],
            }
          : list
      )
    );
  }

  if (selectedList) {
    return (
      <>
        <header className="topbar">
          <div>
            <button
              className="outline-button"
              onClick={() => {
                setSelectedListId(null);
                setBookSearch("");
              }}
              style={{ marginBottom: "12px" }}
            >
              <ArrowLeft size={17} />
              Todas as listas
            </button>

            <span className="welcome-small">MINHA LISTA</span>
            <h2>
              {selectedList.emoji} {selectedList.name}
            </h2>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="outline-button"
              onClick={() => openEditList(selectedList)}
            >
              <Pencil size={17} />
              Editar lista
            </button>

            <button
              className="primary-button"
              onClick={() => setSelectedListId(selectedList.id)}
            >
              <Plus size={18} />
              Adicionar livros
            </button>
          </div>
        </header>

        {selectedList.description && (
          <p
            style={{
              margin: "-10px 0 24px",
              color: "#876d68",
              fontSize: "16px",
            }}
          >
            {selectedList.description}
          </p>
        )}

        <section className="stats-grid" style={{ marginBottom: "24px" }}>
          <div className="stat-card">
            <span className="stat-icon">📚</span>
            <div>
              <strong>{listBooks.length}</strong>
              <span>{listBooks.length === 1 ? "livro" : "livros"}</span>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">✨</span>
            <div>
              <strong>{selectedList.bookIds.length}</strong>
              <span>na lista</span>
            </div>
          </div>
        </section>

        <div className="library-search">
          <Search size={19} />
          <input
            value={bookSearch}
            onChange={(event) => setBookSearch(event.target.value)}
            placeholder="Pesquisar livros para adicionar..."
          />
        </div>

        <section
          className="statistics-card"
          style={{ marginBottom: "24px" }}
        >
          <div style={{ marginBottom: "16px" }}>
            <span className="eyebrow">ADICIONAR À LISTA</span>
            <h3 style={{ margin: "6px 0 4px" }}>
              Escolha os livros que fazem parte dela
            </h3>
            <p style={{ margin: 0 }}>
              Clique em um livro para adicionar ou retirar da lista.
            </p>
          </div>

          {books.length === 0 ? (
            <section className="empty-section">
              <div className="empty-icon">
                <Library size={22} />
              </div>
              <div>
                <h3>Sua biblioteca está vazia</h3>
                <p>Adicione um livro primeiro para colocá-lo em uma lista.</p>
              </div>
              <button
                className="outline-button"
                onClick={() => onNavigate("add")}
              >
                <Plus size={18} />
                Adicionar livro
              </button>
            </section>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "12px",
              }}
            >
              {filteredBooks.map((book) => {
                const included = selectedList.bookIds.includes(book.id);

                return (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => toggleBook(book.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      textAlign: "left",
                      padding: "12px",
                      borderRadius: "16px",
                      border: included
                        ? "2px solid #9a465e"
                        : "1px solid #ead8d2",
                      background: included ? "#f5e2e5" : "#fffaf7",
                      cursor: "pointer",
                      color: "#49302b",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "68px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "#eadbd5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                      }}
                    >
                      {book.cover ? (
                        <img
                          src={book.cover}
                          alt={`Capa de ${book.title}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        "📖"
                      )}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <strong
                        style={{
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {book.title}
                      </strong>
                      <span
                        style={{
                          display: "block",
                          marginTop: "3px",
                          fontSize: "13px",
                          color: "#876d68",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {book.author}
                      </span>
                    </div>

                    <span
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: included ? "#9a465e" : "#f1e5e1",
                        color: included ? "white" : "#876d68",
                        flexShrink: 0,
                        fontSize: "16px",
                      }}
                    >
                      {included ? "✓" : "+"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {listBooks.length > 0 && (
          <section>
            <div style={{ marginBottom: "14px" }}>
              <span className="eyebrow">SEUS LIVROS</span>
              <h3 style={{ margin: "5px 0 0" }}>
                Livros desta lista 📚
              </h3>
            </div>

            <div className="books-grid">
              {listBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onDelete={onDelete}
                  onFavorite={onFavorite}
                  onOpen={onOpen}
                  onEdit={onEdit}
                />
              ))}
            </div>
          </section>
        )}
      </>
    );
  }

  return (
    <>
      <header className="topbar">
        <div>
          <span className="welcome-small">MINHA ORGANIZAÇÃO</span>
          <h2>Minhas listas 📑</h2>
        </div>

        <button className="primary-button" onClick={openNewList}>
          <Plus size={18} />
          Nova lista
        </button>
      </header>

      <section className="stats-intro" style={{ marginBottom: "24px" }}>
        <div>
          <span className="eyebrow">SEU JEITO DE ORGANIZAR</span>
          <h1>Crie listas para cada fase da sua leitura. ✨</h1>
          <p>
            Separe os livros por vontade, gênero, série, prioridade ou por
            qualquer outro motivo que faça sentido para você.
          </p>
        </div>

        <div
          style={{
            minWidth: "92px",
            height: "92px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f0dfe1",
            fontSize: "42px",
          }}
        >
          📑
        </div>
      </section>

      {showForm && (
        <section className="statistics-card" style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "16px",
              alignItems: "flex-start",
              marginBottom: "18px",
            }}
          >
            <div>
              <span className="eyebrow">
                {editingListId ? "EDITAR LISTA" : "NOVA LISTA"}
              </span>
              <h3 style={{ margin: "6px 0 4px" }}>
                {editingListId ? "Deixe sua lista do seu jeito" : "Como você quer organizar seus livros?"}
              </h3>
            </div>

            <button
              className="delete-button"
              onClick={() => setShowForm(false)}
              title="Fechar"
            >
              <X size={17} />
            </button>
          </div>

          <form onSubmit={saveList} className="book-form">
            <div className="form-grid">
              <label>
                <span>Nome da lista *</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ex.: Próximas leituras"
                  required
                />
              </label>

              <label>
                <span>Emoji</span>
                <select
                  value={emoji}
                  onChange={(event) => setEmoji(event.target.value)}
                >
                  <option value="📚">📚 Livros</option>
                  <option value="❤️">❤️ Favoritos</option>
                  <option value="🔥">🔥 Prioridade</option>
                  <option value="✨">✨ Quero muito ler</option>
                  <option value="🌙">🌙 Leituras tranquilas</option>
                  <option value="🐉">🐉 Fantasia</option>
                  <option value="💕">💕 Romances</option>
                  <option value="👑">👑 Séries</option>
                  <option value="🎀">🎀 Especial</option>
                </select>
              </label>
            </div>

            <label>
              <span>Descrição</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Ex.: Livros que quero ler nas próximas semanas..."
                rows={3}
              />
            </label>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                className="outline-button"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="primary-button">
                <Plus size={18} />
                {editingListId ? "Salvar alterações" : "Criar lista"}
              </button>
            </div>
          </form>
        </section>
      )}

      {lists.length === 0 ? (
        <section className="empty-section">
          <div className="empty-icon">📑</div>
          <div>
            <span className="eyebrow">SEU CANTINHO DE ORGANIZAÇÃO</span>
            <h3>Você ainda não criou nenhuma lista</h3>
            <p>
              Crie sua primeira lista e depois escolha quais livros fazem parte dela.
            </p>
          </div>
          <button className="outline-button" onClick={openNewList}>
            <Plus size={18} />
            Criar minha primeira lista
          </button>
        </section>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "18px",
          }}
        >
          {lists.map((list) => {
            const count = list.bookIds.filter((id) =>
              books.some((book) => book.id === id)
            ).length;

            return (
              <article
                key={list.id}
                className="statistics-card"
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedListId(list.id)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "58px",
                      height: "58px",
                      borderRadius: "18px",
                      background: "#f4e5e3",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "29px",
                      flexShrink: 0,
                    }}
                  >
                    {list.emoji}
                  </div>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      className="delete-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        openEditList(list);
                      }}
                      title="Editar lista"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="delete-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteList(list.id);
                      }}
                      title="Excluir lista"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 style={{ margin: "18px 0 6px" }}>{list.name}</h3>

                <p
                  style={{
                    minHeight: "44px",
                    margin: 0,
                    color: "#876d68",
                  }}
                >
                  {list.description || "Uma lista especial para seus livros."}
                </p>

                <div
                  style={{
                    marginTop: "18px",
                    paddingTop: "14px",
                    borderTop: "1px solid #ead8d2",
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#9a465e",
                    fontWeight: 600,
                  }}
                >
                  <span>{count} {count === 1 ? "livro" : "livros"}</span>
                  <span>Ver lista →</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

/* =========================================
   CONFIGURAÇÕES
   ========================================= */

function SettingsPage({
  settings,
  books,
  diaryEntries,
  goals,
  lists,
  onSave,
  onClearDemoBook,
  onResetAll,
}: {
  settings: LibrisSettings;
  books: Book[];
  diaryEntries: DiaryEntry[];
  goals: ReadingGoals;
  lists: ReadingList[];
  onSave: (settings: LibrisSettings) => void;
  onClearDemoBook: () => void;
  onResetAll: () => void;
}) {
  const [draft, setDraft] = useState(settings);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(draft);
    setSavedMessage(true);
    window.setTimeout(() => setSavedMessage(false), 2200);
  }

  function exportData() {
    const data = {
      exportedAt: new Date().toISOString(),
      books,
      goals,
      diaryEntries,
      lists,
      settings,
    };

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `libris-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function resetEverything() {
    const confirmed = window.confirm(
      "Isso apagará livros, metas, diário e listas salvos neste navegador. Deseja continuar?"
    );

    if (!confirmed) return;
    onResetAll();
  }

  return (
    <div className="page-content">
      <div className="topbar">
        <div>
          <span className="eyebrow">MEU LIBRIS</span>
          <h2>Configurações ⚙️</h2>
        </div>
      </div>

      <div className="stats-intro">
        <div>
          <span className="eyebrow">DO SEU JEITO</span>
          <h3>Personalize seu cantinho literário. ✨</h3>
          <p>
            Ajuste seu perfil, preferências e cuide dos dados do seu diário de leitura.
          </p>
        </div>
        <div style={{ fontSize: 58 }}>⚙️</div>
      </div>

      <form onSubmit={saveSettings}>
        <section className="form-section" style={{ marginTop: 24 }}>
          <div className="section-heading">
            <div>
              <span className="eyebrow">PERFIL</span>
              <h3>Como você aparece no Libris?</h3>
            </div>
          </div>

          <div className="form-grid">
            <label>
              Nome
              <input
                value={draft.profileName}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    profileName: event.target.value,
                  }))
                }
                placeholder="Ex.: Laura"
              />
            </label>

            <label>
              Emoji do perfil
              <select
                value={draft.profileEmoji}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    profileEmoji: event.target.value,
                  }))
                }
              >
                <option value="📚">📚 Livros</option>
                <option value="📖">📖 Leitura</option>
                <option value="💕">💕 Romântica</option>
                <option value="✨">✨ Sonhadora</option>
                <option value="🌙">🌙 Leitora noturna</option>
                <option value="☕">☕ Leitora de café</option>
              </select>
            </label>
          </div>
        </section>

        <section className="form-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">APARÊNCIA</span>
              <h3>Como você quer ver o Libris?</h3>
              <p style={{ marginTop: 6 }}>Escolha entre o tema claro e o tema escuro.</p>
            </div>
          </div>

          <div className="theme-options">
            <button
              type="button"
              className={`theme-option ${draft.theme === "light" ? "selected" : ""}`}
              onClick={() =>
                setDraft((current) => ({ ...current, theme: "light" }))
              }
            >
              <span className="theme-preview light-preview">☀️</span>
              <span>
                <strong>Tema claro</strong>
                <small>Leve, delicado e aconchegante</small>
              </span>
            </button>

            <button
              type="button"
              className={`theme-option ${draft.theme === "dark" ? "selected" : ""}`}
              onClick={() =>
                setDraft((current) => ({ ...current, theme: "dark" }))
              }
            >
              <span className="theme-preview dark-preview">🌙</span>
              <span>
                <strong>Tema escuro</strong>
                <small>Confortável para ler à noite</small>
              </span>
            </button>
          </div>
        </section>

        <section className="form-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">PREFERÊNCIAS</span>
              <h3>Suas preferências de leitura</h3>
            </div>
          </div>

          <div className="form-grid">
            <label>
              Gênero favorito
              <select
                value={draft.favoriteGenre}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    favoriteGenre: event.target.value,
                  }))
                }
              >
                <option>Fantasia</option>
                <option>Romance</option>
                <option>Fantasia Romântica</option>
                <option>Ficção</option>
                <option>Suspense</option>
                <option>Thriller</option>
                <option>Young Adult</option>
                <option>Outro</option>
              </select>
            </label>

            <label className="settings-toggle" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 14, paddingTop: 28 }}>
              <input
                type="checkbox"
                checked={draft.notifications}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    notifications: event.target.checked,
                  }))
                }
                style={{ width: 20, height: 20 }}
              />
              <span>
                <strong>Lembretes de leitura</strong>
                <small style={{ display: "block", marginTop: 4 }}>
                  Ativar preferência para lembretes futuros.
                </small>
              </span>
            </label>
          </div>
        </section>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20 }}>
          <button className="primary-button" type="submit">
            Salvar configurações
          </button>
          {savedMessage && (
            <span style={{ color: "#8d4658", fontWeight: 600 }}>
              ✓ Salvo!
            </span>
          )}
        </div>
      </form>

      <section className="form-section" style={{ marginTop: 28 }}>
        <div className="section-heading">
          <div>
            <span className="eyebrow">SEUS DADOS</span>
            <h3>Cuide da sua biblioteca</h3>
          </div>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          <div className="settings-action-card">
            <div>
              <strong>💾 Fazer backup</strong>
              <p>Baixe seus livros, metas, diário, listas e configurações em um arquivo.</p>
            </div>
            <button className="outline-button" type="button" onClick={exportData}>
              Exportar dados
            </button>
          </div>

          <div className="settings-action-card">
            <div>
              <strong>✨ Livro de demonstração</strong>
              <p>
                O Quarta Asa usado como exemplo pode ser retirado quando você quiser.
              </p>
            </div>
            <button className="outline-button" type="button" onClick={onClearDemoBook}>
              Excluir demonstração
            </button>
          </div>

          <div className="settings-action-card danger-card">
            <div>
              <strong>🗑️ Apagar todos os dados</strong>
              <p>Remove os dados do Libris salvos neste navegador.</p>
            </div>
            <button className="outline-button danger-button" type="button" onClick={resetEverything}>
              Apagar tudo
            </button>
          </div>
        </div>
      </section>

      <section className="statistics-card" style={{ marginTop: 28, marginBottom: 40 }}>
        <span className="eyebrow">RESUMO</span>
        <h3>Seu Libris</h3>
        <p>
          {books.length} {books.length === 1 ? "livro" : "livros"} · {diaryEntries.length} {diaryEntries.length === 1 ? "anotação" : "anotações"} · {lists.length} {lists.length === 1 ? "lista" : "listas"}
        </p>
        <p style={{ marginTop: 6 }}>
          Perfil: {draft.profileEmoji} {draft.profileName || "Leitora"}
        </p>
      </section>
    </div>
  );
}

/* =========================================
   PÁGINAS FUTURAS
   ========================================= */



export default App;