//
//  zimReader.h
//  KiwixTest
//
//  Created by Chris Li on 8/1/14.
//  Copyright (c) 2014 Chris. All rights reserved.
//

#import <Foundation/Foundation.h>
#include "reader.h"

@interface zimReader : NSObject {
    kiwix::Reader *_reader;
}

- (id)initWithZIMFileURL:(NSURL *)url;

- (NSString *)htmlContentOfPageWithPageURL:(NSString *)pageURL;//Will return nil if there is no page with that specific URL
- (NSString *)htmlContentOfMainPage;

- (NSString *)pageURLFromTitle:(NSString *)title;//Will return nil if there is no such page with the specific title
- (NSString *)mainPageURL;//Will return nil if the zim file have no main page, not sure if this will ever happen

- (NSString *)getTitle;
- (NSString *)getDate;

- (void)dealloc;

@end
