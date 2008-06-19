#include "backend.h"
#include "zeno.h"
#include "html.h"

static backend_struct * available_backends[] = {
	&htmlBackend
#ifdef HAVE_LIBZENO
	,&zenoBackend
#endif
};

backend_struct * backendInit( const gchar * root ) {

	backend_struct * backend;
	unsigned int i, n;
	n = sizeof(available_backends) / sizeof(backend_struct *);

	printf("searching a valid backend through the %d available\n", n);

	i = 0;

	while( i < n ) {
		backend = available_backends[i];

		if ( backend->parserInit( root ) ) {
			return backend;
		}

		i++;
	}
	
	return NULL;
}
